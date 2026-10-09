import { useEffect, useRef } from "react";

import styles from "./Lathe.module.css";

/** One pass, start of cut to end of cut, in ms. */
import {
  CUT_MS,
  HOLD_MS,
  PITCH,
  GROOVE,
  SURFACE_SPEED,
  CHIP_GRAVITY,
  CHIP_MAX,
} from "../constants";

interface Chip {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface Palette {
  paper: string;
  stock: string;
  ink: string;
  muted: string;
  accent: string;
  accentSoft: string;
  display: string;
}

/**
 * Colours and the display face come from the token layer, read once. Raw hex
 * here would be a second source for colours tokens.css already owns.
 */
function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const token = (name: string) => css.getPropertyValue(name).trim();
  return {
    paper: token("--paper"),
    stock: token("--stock-100"),
    ink: token("--stock-950"),
    muted: token("--stock-400"),
    accent: token("--lavinder-600"),
    accentSoft: token("--lavinder-400"),
    display: token("--font-display"),
  };
}

function pad(value: number, width: number): string {
  return String(value).padStart(width, "0");
}

/**
 * The hero instrument: a bar of stock in a chuck, and a knurling tool walking
 * along it pressing the diamond grain in. The part is the studio's name.
 *
 * Drawn flat — ink edges, paper, lavinder teeth — on the same rules as the
 * CSS: no gradients, no glow. Rotation reads as the teeth travelling up the
 * cut section. Stops drawing when it is off screen, and for a reader who asked
 * for less motion it draws one frame, the finished part, and never animates.
 */
export function Lathe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      return;
    }

    const palette = readPalette();

    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let last = 0;
    // Start partway through a pass, so the first thing seen is work under way.
    let clock = CUT_MS * 0.35;
    let spin = 0;
    let pass = 1;
    let chips: Chip[] = [];

    function resize() {
      if (!canvas || !ctx) {
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    /** Where everything sits, from the canvas size. */
    function geometry() {
      const cy = height * 0.46;
      const r = Math.max(18, Math.min(34, height * 0.15));
      const chuckW = Math.max(54, width * 0.12);
      const tailW = Math.max(40, width * 0.08);
      const barX0 = chuckW;
      const barX1 = width - tailW;
      return {
        cy,
        r,
        chuckW,
        tailW,
        barX0,
        barX1,
        cutX0: barX0 + 18,
        cutX1: barX1 - 24,
      };
    }

    /** A rectangle with its top-left and bottom-right corners cut at 45°. */
    function chamfer(x: number, y: number, w: number, h: number, c: number) {
      if (!ctx) {
        return;
      }
      ctx.beginPath();
      ctx.moveTo(x + c, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + h - c);
      ctx.lineTo(x + w - c, y + h);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x, y + c);
      ctx.closePath();
    }

    function draw(progress: number, toolOut: number) {
      if (!ctx) {
        return;
      }
      const p = palette;
      ctx.clearRect(0, 0, width, height);

      const { cy, r, chuckW, tailW, barX0, barX1, cutX0, cutX1 } = geometry();
      const cutX = cutX0 + (cutX1 - cutX0) * progress;

      // Stock.
      ctx.fillStyle = p.stock;
      ctx.fillRect(barX0, cy - r, barX1 - barX0, r * 2);

      // The knurled length: lavinder, with the grooves cut through it as
      // paper lines at ±45°. Both families slide up together as it turns.
      if (cutX > cutX0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(cutX0, cy - r, cutX - cutX0, r * 2);
        ctx.clip();
        ctx.fillStyle = p.accent;
        ctx.fillRect(cutX0, cy - r, cutX - cutX0, r * 2);
        ctx.strokeStyle = p.paper;
        ctx.lineWidth = GROOVE;
        const offset = spin % PITCH;
        const span = r * 2 + (cutX - cutX0);
        ctx.beginPath();
        for (let k = -span; k < span + PITCH; k += PITCH) {
          const base = cutX0 + k;
          ctx.moveTo(base, cy + r + offset);
          ctx.lineTo(base + r * 2 + PITCH, cy - r - PITCH + offset);
          ctx.moveTo(base, cy - r - PITCH + offset);
          ctx.lineTo(base + r * 2 + PITCH, cy + r + offset);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Bar outline, over the knurl so the edge stays crisp.
      ctx.strokeStyle = p.ink;
      ctx.lineWidth = 2;
      ctx.strokeRect(barX0, cy - r, barX1 - barX0, r * 2);

      // Chuck: a stepped block of jaws.
      ctx.fillStyle = p.ink;
      chamfer(0, cy - r - 30, chuckW - 14, r * 2 + 60, 10);
      ctx.fill();
      ctx.fillRect(chuckW - 16, cy - r - 10, 16, r * 2 + 20);
      ctx.fillStyle = p.paper;
      for (let i = 0; i < 3; i += 1) {
        ctx.fillRect(10 + i * 10, cy - r - 18, 4, r * 2 + 36);
      }

      // Tailstock and its centre point.
      ctx.fillStyle = p.ink;
      ctx.beginPath();
      ctx.moveTo(barX1, cy);
      ctx.lineTo(barX1 + 14, cy - 10);
      ctx.lineTo(barX1 + 14, cy + 10);
      ctx.closePath();
      ctx.fill();
      chamfer(barX1 + 14, cy - r - 8, tailW - 14, r * 2 + 16, 8);
      ctx.fill();

      // Tool: two knurl wheels, top and bottom, on a holder off the top edge.
      // toolOut backs it away from the work when the pass ends.
      const toolW = 26;
      const wheelH = 12;
      const gap = 2 + toolOut * 26;
      const tx = cutX - toolW / 2;
      ctx.fillStyle = p.ink;
      ctx.fillRect(tx + 6, 0, toolW - 12, cy - r - gap - wheelH);
      chamfer(tx - 4, cy - r - gap - wheelH - 22, toolW + 8, 22, 6);
      ctx.fill();
      for (const sign of [-1, 1]) {
        const wy = sign < 0 ? cy - r - gap - wheelH : cy + r + gap;
        ctx.fillStyle = p.accent;
        ctx.fillRect(tx, wy, toolW, wheelH);
        ctx.fillStyle = p.paper;
        for (let tooth = 0; tooth < toolW; tooth += 5) {
          const tooth0 = (tooth + spin * 0.5) % toolW;
          ctx.fillRect(tx + tooth0, wy, 2, wheelH);
        }
        ctx.strokeStyle = p.ink;
        ctx.lineWidth = 2;
        ctx.strokeRect(tx, wy, toolW, wheelH);
      }
      ctx.fillStyle = p.ink;
      ctx.fillRect(tx + 6, cy + r + gap + wheelH, toolW - 12, 10);

      // Chips: small ink squares thrown off the cut.
      ctx.fillStyle = p.ink;
      for (const chip of chips) {
        ctx.fillRect(Math.round(chip.x), Math.round(chip.y), 3, 3);
      }

      // Dimension line under the part, the way the drawing would call it out.
      const dy = cy + r + 44;
      ctx.strokeStyle = p.muted;
      ctx.fillStyle = p.muted;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cutX0, dy - 8);
      ctx.lineTo(cutX0, dy + 8);
      ctx.moveTo(cutX1, dy - 8);
      ctx.lineTo(cutX1, dy + 8);
      ctx.moveTo(cutX0, dy);
      ctx.lineTo(cutX1, dy);
      ctx.stroke();
      for (const [x, dir] of [
        [cutX0, 1],
        [cutX1, -1],
      ] as const) {
        ctx.beginPath();
        ctx.moveTo(x, dy);
        ctx.lineTo(x + dir * 7, dy - 4);
        ctx.lineTo(x + dir * 7, dy + 4);
        ctx.closePath();
        ctx.fill();
      }
      ctx.font = `11px ${p.display}`;
      ctx.textBaseline = "top";
      ctx.fillStyle = p.ink;
      const label = "DIAMOND KNURL 30° · P 1.2";
      const labelW = ctx.measureText(label).width;
      const lx = (cutX0 + cutX1) / 2 - labelW / 2;
      ctx.fillStyle = p.paper;
      ctx.fillRect(lx - 6, dy - 7, labelW + 12, 14);
      ctx.fillStyle = p.ink;
      ctx.fillText(label, lx, dy - 5);
    }

    function writeReadout(progress: number) {
      if (!readoutRef.current) {
        return;
      }
      const rpm = progress < 1 ? 360 : 0;
      readoutRef.current.textContent =
        `RPM ${pad(rpm, 4)}   FEED 0.20   PASS ${pad(pass, 3)}   ` +
        `${pad(Math.round(progress * 100), 3)}%`;
    }

    function step(now: number) {
      frame = 0;
      const dt = last === 0 ? 16 : Math.min(48, now - last);
      last = now;
      clock += dt;

      let progress: number;
      let toolOut: number;
      if (clock < CUT_MS) {
        progress = clock / CUT_MS;
        toolOut = 0;
        spin += dt * SURFACE_SPEED * 3;
        if (chips.length < CHIP_MAX && Math.random() < 0.55) {
          const { cy, r, cutX0, cutX1 } = geometry();
          const top = Math.random() < 0.5;
          chips.push({
            x: cutX0 + (cutX1 - cutX0) * progress + 14,
            y: top ? cy - r : cy + r,
            vx: 0.04 + Math.random() * 0.12,
            vy: top
              ? -0.08 - Math.random() * 0.12
              : 0.02 + Math.random() * 0.06,
            life: 900 + Math.random() * 600,
          });
        }
      } else if (clock < CUT_MS + HOLD_MS) {
        progress = 1;
        toolOut = Math.min(1, (clock - CUT_MS) / 300);
        spin += dt * SURFACE_SPEED;
      } else {
        clock = 0;
        pass += 1;
        progress = 0;
        toolOut = 0;
      }

      chips = chips.filter((chip) => {
        chip.vy += CHIP_GRAVITY * dt;
        chip.x += chip.vx * dt;
        chip.y += chip.vy * dt;
        chip.life -= dt;
        return chip.life > 0 && chip.y < height && chip.x < width;
      });

      draw(progress, toolOut);
      writeReadout(progress);
      schedule();
    }

    function schedule() {
      if (frame === 0 && visible) {
        frame = requestAnimationFrame(step);
      }
    }

    resize();
    const sizer = new ResizeObserver(() => {
      resize();
    });
    sizer.observe(canvas);

    const watcher = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      last = 0;
      schedule();
    });
    watcher.observe(canvas);
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      sizer.disconnect();
      watcher.disconnect();
    };
  }, []);

  return (
    <div className={styles.lathe}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        role="img"
        aria-label="A knurling tool travelling along a steel bar on a lathe, pressing a diamond pattern into it."
      />
      <p ref={readoutRef} className={styles.readout} aria-hidden="true">
        RPM 0360 FEED 0.20 PASS 001 000%
      </p>
    </div>
  );
}
