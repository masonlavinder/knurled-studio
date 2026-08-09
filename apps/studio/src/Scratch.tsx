import { catalog, STATUSES } from '@knurled/catalog';
import {
  cx,
  Knurl,
  Panel,
  PartNumber,
  RegistrationMarks,
  SpecTable,
  StatusChip,
  StudioFooter,
} from '@knurled/kit';

import styles from './Scratch.module.css';

interface SectionProps {
  label: string;
  children: React.ReactNode;
}

function Section({ label, children }: SectionProps) {
  return (
    <section className={cx(styles.section, styles.sectionRule)}>
      <h2 className={styles.sectionLabel}>{label}</h2>
      {children}
    </section>
  );
}

/**
 * Scratch route. Renders every primitive once so the kit can be checked at a
 * glance and tabbed through. Phase 3 replaces this with the real routes.
 */
export function Scratch() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Kit</h1>
        <PartNumber id="KS-000" />
      </header>

      <Knurl height={10} />

      <Section label="Panel · tone">
        <div className={styles.grid}>
          <Panel>
            <p className={styles.panelTitle}>tone: default</p>
            <p className={styles.note}>Edge in --edge. Chamfer 13 px, top-left and bottom-right.</p>
          </Panel>
          <Panel tone="accent">
            <p className={styles.panelTitle}>tone: accent</p>
            <p className={styles.note}>Edge in --lavinder-600.</p>
          </Panel>
          <Panel tone="warn">
            <p className={styles.panelTitle}>tone: warn</p>
            <p className={styles.note}>Edge in --straw-400.</p>
          </Panel>
        </div>
      </Section>

      <Section label="Panel · interactive · tab through these">
        <div className={styles.grid}>
          <Panel interactive onClick={() => undefined}>
            <p className={styles.panelTitle}>button</p>
            <p className={styles.note}>Focus ring is an inset box-shadow on the face.</p>
          </Panel>
          <Panel interactive as="a" href="https://knurled.studio" tone="accent">
            <p className={styles.panelTitle}>anchor</p>
            <p className={styles.note}>clip-path would clip an outline, so it does not use one.</p>
          </Panel>
        </div>
      </Section>

      <Section label="StatusChip">
        <div className={styles.row}>
          {STATUSES.map((status) => (
            <StatusChip key={status} status={status} />
          ))}
        </div>
      </Section>

      <Section label="PartNumber">
        <div className={styles.row}>
          {catalog.map((entry) => (
            <PartNumber key={entry.partNumber} id={entry.partNumber} />
          ))}
        </div>
      </Section>

      <Section label="SpecTable">
        <Panel>
          <SpecTable
            caption="KS-002 · watchthediff"
            rows={[
              { label: 'Stack', value: 'FastAPI · React' },
              { label: 'First cut', value: '2025' },
              { label: 'Host', value: 'watchthediff.knurled.studio' },
              { label: 'Source', value: 'Closed' },
              { label: 'Median response', value: '142 ms' },
            ]}
          />
        </Panel>
      </Section>

      <Section label="Knurl">
        <div className={styles.stack}>
          <Knurl height={7} />
          <Knurl height={14} />
          <Knurl height={28} />
        </div>
      </Section>

      <Section label="RegistrationMarks">
        <div className={styles.marked}>
          <RegistrationMarks />
          <p className={styles.note}>Corner ticks in --stock-400. Decorative, so aria-hidden.</p>
        </div>
      </Section>

      <StudioFooter partNumber="KS-000" />
    </div>
  );
}
