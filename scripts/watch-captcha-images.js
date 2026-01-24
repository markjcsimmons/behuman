#!/usr/bin/env node
/**
 * Watches captcha-images/people, captcha-images/nonpeople, and nonhumans/
 * and regenerates captcha-images/manifest.json whenever you add or delete
 * images. The app will use the new list on next load/refresh.
 *
 * Run and leave in the background while you work:
 *   node scripts/watch-captcha-images.js
 *
 * Ctrl+C to stop.
 */

const fs = require('fs');
const path = require('path');
const { buildAndWriteManifest } = require('./update-captcha-manifest');

const ROOT = path.resolve(__dirname, '..');
const DIRS = [
  { path: path.join(ROOT, 'captcha-images', 'people'), name: 'people' },
  { path: path.join(ROOT, 'captcha-images', 'nonpeople'), name: 'nonpeople' },
  { path: path.join(ROOT, 'nonhumans'), name: 'nonhumans' },
];

let debounce = null;
const DEBOUNCE_MS = 400;

function scheduleUpdate() {
  if (debounce) clearTimeout(debounce);
  debounce = setTimeout(() => {
    debounce = null;
    try {
      const m = buildAndWriteManifest();
      const t = new Date().toLocaleTimeString();
      console.log(`[${t}] Manifest updated — people: ${m.people.length}, nonpeople: ${m.nonpeople.length}, nonhumans: ${m.nonhumans.length}`);
    } catch (err) {
      console.error('Error updating manifest:', err.message);
    }
  }, DEBOUNCE_MS);
}

// Initial build
try {
  const m = buildAndWriteManifest();
  console.log('Watching for image changes. Initial manifest: people %d, nonpeople %d, nonhumans %d',
    m.people.length, m.nonpeople.length, m.nonhumans.length);
} catch (err) {
  console.error('Initial manifest build failed:', err.message);
  process.exit(1);
}

for (const { path: dir, name } of DIRS) {
  if (!fs.existsSync(dir)) {
    console.warn('Skipping (folder missing):', name);
    continue;
  }
  try {
    fs.watch(dir, { persistent: true }, (event, filename) => {
      // filename can be null on some platforms; if present, only react to image files
      if (!filename || /\.(jpg|jpeg|png|webp|gif)$/i.test(filename)) scheduleUpdate();
    });
    console.log('Watching:', name);
  } catch (e) {
    console.warn('Could not watch', name, ':', e.message);
  }
}

console.log('Add or delete images in those folders — manifest will update. Ctrl+C to stop.\n');
