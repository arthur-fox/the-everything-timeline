import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

// Where the site is served from. GitHub Pages project site: '/the-everything-timeline/'.
// On a custom domain (public/CNAME), change this to '/' (see README → "Custom domain").
// PR previews override it with `--base` in .github/workflows/pr-preview.yml.
const BASE = '/the-everything-timeline/';

function gitCommit() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return 'dev';
  }
}

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

export default defineConfig({
  base: BASE,
  define: {
    // Day 45: attached to feedback so reports say which build they came from.
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_COMMIT__: JSON.stringify(gitCommit()),
    __APP_BUILT__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  build: {
    outDir: 'dist',
  },
});
