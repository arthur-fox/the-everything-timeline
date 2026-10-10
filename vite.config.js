import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// Day 46: the site lives at the root of https://theeverythingtimeline.com/ (public/CNAME).
export const SITE_ORIGIN = 'https://theeverythingtimeline.com';
const BASE = '/';

// The old GitHub Pages project path. PR previews are still built with
// `--base=/the-everything-timeline/pr-preview/pr-N/` by .github/workflows/pr-preview.yml;
// once the custom domain is live those previews are served at /pr-preview/pr-N/, so the
// prefix is dropped (see previewBase below). No workflow change is needed.
const OLD_PROJECT_PATH = '/the-everything-timeline/';

function gitCommit() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return 'dev';
  }
}

/**
 * Is the custom domain serving this repo yet? GitHub Pages answers the old project URL with a
 * redirect to the custom domain once Settings → Pages has it. Override with
 * CUSTOM_DOMAIN_LIVE=1 / 0 (e.g. offline builds).
 */
async function customDomainLive() {
  const env = process.env.CUSTOM_DOMAIN_LIVE;
  if (env === '1' || env === 'true') return true;
  if (env === '0' || env === 'false') return false;
  try {
    const res = await fetch('https://arthur-fox.github.io/the-everything-timeline/', {
      redirect: 'manual',
      signal: AbortSignal.timeout(6000),
    });
    const loc = res.headers.get('location') || '';
    return res.status >= 300 && res.status < 400 && new URL(loc, 'https://x/').hostname.replace(/^www\./, '') === new URL(SITE_ORIGIN).hostname;
  } catch (err) {
    // Network trouble: assume the domain is live (the steady state after cutover).
    console.warn(`[base] could not check the custom domain (${err.message}); assuming it is live`);
    return true;
  }
}

/** Rewrites `--base=/the-everything-timeline/…` (PR previews) to `/…` once the domain is live. */
function previewBase() {
  return {
    name: 'everything-timeline-preview-base',
    async config(config, { command }) {
      if (process.env.SITE_BASE) return { base: process.env.SITE_BASE };
      const base = config.base || BASE;
      if (command !== 'build' || !base.startsWith(OLD_PROJECT_PATH)) return;
      if (!(await customDomainLive())) {
        console.log(`[base] custom domain not live yet: keeping ${base}`);
        return;
      }
      const next = `/${base.slice(OLD_PROJECT_PATH.length)}`;
      console.log(`[base] custom domain live: ${base} → ${next}`);
      return { base: next };
    },
  };
}

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

export default defineConfig({
  base: BASE,
  plugins: [previewBase()],
  resolve: {
    // Day 49: drop the unused WebGPU build of three (~1 MB raw, ~250 KB gzipped) from the
    // globe chunk; see src/vendor/three-webgpu-stub.js.
    alias: [
      { find: /^three\/webgpu$/, replacement: fileURLToPath(new URL('./src/vendor/three-webgpu-stub.js', import.meta.url)) },
      { find: /^three\/tsl$/, replacement: fileURLToPath(new URL('./src/vendor/three-tsl-stub.js', import.meta.url)) },
    ],
  },
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
