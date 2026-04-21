// Merida's Garden — WebP image sync
//
// For every image reference in butterflies.json and bees.json, check whether
// a .webp version of that file exists on disk. If so, rewrite the JSON
// reference to point at the .webp instead of the .jpg.
//
// Nothing is deleted — the old .jpg files stay put unless you remove them
// yourself. So if anything looks wrong, your originals are still there.
//
// Run with:  node sync-webp-images.js
// Safe to re-run anytime you add more webp images.

const fs   = require('fs');
const path = require('path');

const projectRoot = __dirname;
const publicDir   = path.join(projectRoot, 'public');

const files = [
  {
    label: 'butterflies',
    json:  path.join(projectRoot, 'src', 'data', 'butterflies.json'),
    fields: [
      (entry) => entry.image,
      (entry) => entry.caterpillar && entry.caterpillar.image,
    ],
    setters: [
      (entry, value) => { entry.image = value; },
      (entry, value) => { if (entry.caterpillar) entry.caterpillar.image = value; },
    ],
  },
  {
    label: 'bees',
    json:  path.join(projectRoot, 'src', 'data', 'bees.json'),
    fields: [
      (entry) => entry.image,
    ],
    setters: [
      (entry, value) => { entry.image = value; },
    ],
  },
];

function webpVariant(refPath) {
  // refPath looks like '/images/butterflies/monarch.jpg'
  // We want to check if the file on disk exists with a .webp extension.
  if (!refPath || typeof refPath !== 'string') return null;
  const withoutExt = refPath.replace(/\.(jpg|jpeg|png)$/i, '');
  if (withoutExt === refPath) return null; // no recognized extension
  return withoutExt + '.webp';
}

function existsOnDisk(publicPath) {
  // publicPath looks like '/images/butterflies/monarch.webp'
  // Convert to an absolute disk path under public/
  const rel = publicPath.replace(/^\//, '');
  return fs.existsSync(path.join(publicDir, rel));
}

let totalSwapped = 0;
let totalKept    = 0;

for (const group of files) {
  console.log(`\n— ${group.label} —`);

  if (!fs.existsSync(group.json)) {
    console.log(`  ⚠  JSON not found: ${group.json}`);
    continue;
  }

  const data = JSON.parse(fs.readFileSync(group.json, 'utf-8'));
  let swapped = 0;
  let kept    = 0;

  for (const entry of data) {
    for (let i = 0; i < group.fields.length; i++) {
      const current = group.fields[i](entry);
      if (!current) continue;

      const webpRef = webpVariant(current);
      if (!webpRef) continue;

      if (current.endsWith('.webp')) {
        // Already using webp — nothing to do
        kept++;
        continue;
      }

      if (existsOnDisk(webpRef)) {
        group.setters[i](entry, webpRef);
        console.log(`  ✅ ${current}  →  ${webpRef}`);
        swapped++;
      } else {
        kept++;
      }
    }
  }

  fs.writeFileSync(group.json, JSON.stringify(data, null, 2) + '\n');
  console.log(`  ${swapped} swapped, ${kept} kept as-is.`);
  totalSwapped += swapped;
  totalKept    += kept;
}

console.log(`\n─────────────────────────────────────────`);
console.log(`✅ Swapped ${totalSwapped} references to .webp`);
console.log(`   Kept ${totalKept} references as-is (no webp version on disk)`);
console.log(`\nDone. Review the changes, then commit & push.\n`);
