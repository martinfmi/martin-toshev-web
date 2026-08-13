import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const siteDir = existsSync('dist/client') ? 'dist/client' : 'dist';

const result = spawnSync(
  'pagefind',
  [
    '--site',
    siteDir,
    '--output-subdir',
    'pagefind',
    '--root-selector',
    'main',
    '--exclude-selectors',
    '[data-pagefind-ignore]',
  ],
  { stdio: 'inherit', shell: true },
);

process.exit(result.status ?? 1);
