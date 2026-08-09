/**
 * Build-time validation. `catalog` is validated at module load, so importing it
 * is the check; this wrapper turns a fault into a readable build failure and
 * prints the manifest on success.
 */
import { CatalogError } from './validate.ts';

try {
  const { catalog } = await import('./index.ts');

  const partWidth = Math.max(...catalog.map((entry) => entry.partNumber.length));
  const nameWidth = Math.max(...catalog.map((entry) => entry.name.length));

  for (const entry of catalog) {
    process.stdout.write(
      `${entry.partNumber.padEnd(partWidth)}  ${entry.name.padEnd(nameWidth)}  ${entry.status}\n`,
    );
  }
  process.stdout.write(`${String(catalog.length)} entries · ok\n`);
} catch (error) {
  if (error instanceof CatalogError) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
  throw error;
}
