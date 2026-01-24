#!/usr/bin/env node
/**
 * Scans captcha-images/people, captcha-images/nonpeople, and nonhumans/
 * and writes captcha-images/manifest.json with arrays of image paths.
 *
 * Run after adding or removing images:
 *   node scripts/update-captcha-manifest.js
 *
 * Or run scripts/watch-captcha-images.js to regenerate automatically
 * whenever you add/delete images in those folders.
 *
 * The app fetches this manifest and randomly picks from each list—no
 * hardcoded filenames in the app.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXT = /\.(jpg|jpeg|png|webp|gif)$/i;

function listImages(dir, prefix) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full)
    .filter((n) => EXT.test(n) && !n.startsWith('.'))
    .map((n) => prefix + n);
}

function buildManifest() {
  return {
    people: listImages('captcha-images/people', 'captcha-images/people/'),
    nonpeople: listImages('captcha-images/nonpeople', 'captcha-images/nonpeople/'),
    nonhumans: listImages('nonhumans', 'nonhumans/'),
  };
}

function buildAndWriteManifest() {
  const manifest = buildManifest();
  const out = path.join(ROOT, 'captcha-images', 'manifest.json');
  fs.writeFileSync(out, JSON.stringify(manifest, null, 2), 'utf8');
  return manifest;
}

if (require.main === module) {
  const manifest = buildAndWriteManifest();
  console.log('Wrote', path.join(ROOT, 'captcha-images', 'manifest.json'));
  console.log('  people:', manifest.people.length, '| nonpeople:', manifest.nonpeople.length, '| nonhumans:', manifest.nonhumans.length);
}

module.exports = { buildManifest, buildAndWriteManifest };
