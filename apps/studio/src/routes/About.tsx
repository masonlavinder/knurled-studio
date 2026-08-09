import { catalog } from '@knurled/catalog';
import { Panel, SpecTable } from '@knurled/kit';

import { PageHead } from '../shell/Shell.tsx';
import styles from './About.module.css';

export function About() {
  return (
    <>
      <PageHead
        eyebrow="Operator"
        title="About"
        lede="One person. Several small tools, each on its own subdomain."
      />

      <div className={styles.prose}>
        <p>
          Knurled Studio is a one-person software studio. Every part in the index was designed,
          built, and is kept running by the same person.
        </p>
        <p>
          Knurling is the diamond-cut texture on a thumbscrew or a camera dial — grip where a hand
          needs it, and nowhere else. The work here is meant the same way: tools sized to one task,
          finished properly, and no larger than the task requires.
        </p>
        <p>me.knurled.studio redirects to this page.</p>
      </div>

      <div className={styles.spec}>
        <Panel>
          <SpecTable
            caption="Shop"
            rows={[
              { label: 'Operator', value: 'Mason Lavinder' },
              { label: 'Studio', value: 'knurled.studio' },
              { label: 'First cut', value: '2026' },
              { label: 'Parts', value: String(catalog.length) },
              { label: 'Stack', value: 'TypeScript · React · FastAPI · AWS' },
            ]}
          />
        </Panel>
      </div>
    </>
  );
}
