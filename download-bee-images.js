// Merida's Garden — Bee Image Downloader
// Uses the same Pixabay API pattern as download-butterfly-images.js.
// Run with:  node download-bee-images.js
//
// Images land in: public/images/bees/
// Already-downloaded files are skipped, so it's safe to re-run.

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

// Same key as existing downloaders
const API_KEY = '55430627-49324529e03a6beb384866d80';

// One entry per image file (one adult photo per bee species).
// Queries are tuned to get a reasonable Pixabay match.
const items = [
  { file: 'honeybee.jpg',                  query: 'honeybee apis mellifera flower' },
  { file: 'eastern-bumblebee.jpg',         query: 'bumblebee bombus impatiens yellow black' },
  { file: 'eastern-carpenter-bee.jpg',     query: 'carpenter bee xylocopa virginica' },
  { file: 'metallic-green-sweat-bee.jpg',  query: 'metallic green sweat bee agapostemon' },
  { file: 'leafcutter-bee.jpg',            query: 'leafcutter bee megachile' },
  { file: 'mason-bee.jpg',                 query: 'mason bee osmia blue' },
  { file: 'squash-bee.jpg',                query: 'squash bee peponapis pruinosa' },
  { file: 'long-horned-bee.jpg',           query: 'long horned bee melissodes sunflower' },
  { file: 'small-carpenter-bee.jpg',       query: 'small carpenter bee ceratina' },
  { file: 'digger-bee.jpg',                query: 'digger bee anthophora fuzzy' },
];

// Output directory
const outDir = path.join(__dirname, 'public', 'images', 'bees');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Helpers
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    proto.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(destPath);
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
      file.on('error', reject);
    }).on('error', (err) => {
      fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

function pixabaySearch(query) {
  return new Promise((resolve, reject) => {
    const q = encodeURIComponent(query);
    const url = `https://pixabay.com/api/?key=${API_KEY}&q=${q}&image_type=photo&per_page=5&safesearch=true&orientation=horizontal&min_width=600`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.hits || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log(`\n🐝 Merida's Garden — Downloading ${items.length} bee images from Pixabay\n`);
  console.log('─'.repeat(60));

  let success = 0;
  let skipped = 0;
  let failed  = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const destPath = path.join(outDir, item.file);

    if (fs.existsSync(destPath)) {
      console.log(`  ⏭  [${i+1}/${items.length}] Skipped (exists): ${item.file}`);
      skipped++;
      continue;
    }

    try {
      const hits = await pixabaySearch(item.query);

      if (!hits || hits.length === 0) {
        console.log(`  ❌ [${i+1}/${items.length}] No results: ${item.file} (query: "${item.query}")`);
        failed++;
        continue;
      }

      const hit = hits.find(h => h.webformatURL) || hits[0];
      const imageUrl = hit.webformatURL;

      await downloadFile(imageUrl, destPath);
      console.log(`  ✅ [${i+1}/${items.length}] ${item.file}`);
      success++;

      await sleep(1100);
    } catch (err) {
      console.log(`  ❌ [${i+1}/${items.length}] Error for ${item.file}: ${err.message}`);
      failed++;
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`\n✅ Downloaded: ${success}`);
  console.log(`⏭  Skipped (already existed): ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('\n🐝 Done! Images saved to: public/images/bees/\n');
  console.log('Note: Pixabay may not have a species-specific image for every entry.');
  console.log('For any that failed or look wrong, drop a replacement JPG into that folder manually.');
  console.log('\nRefresh your browser to see them on the site.\n');
}

run();
