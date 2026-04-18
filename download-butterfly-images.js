// Merida's Garden — Butterfly & Caterpillar Image Downloader
// Uses the same Pixabay API pattern as download-images.js.
// Run with:  node download-butterfly-images.js
//
// Images land in: public/images/butterflies/
// Already-downloaded files are skipped, so it's safe to re-run.

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

// Same key as your existing downloader
const API_KEY = '55430627-49324529e03a6beb384866d80';

// One entry per image file.
// Butterfly adults AND caterpillars are both downloaded.
// Queries are tuned to get a reasonable Pixabay match.
const items = [
  // Zebra Longwing
  { file: 'zebra-longwing.jpg',                 query: 'zebra longwing butterfly heliconius' },
  { file: 'zebra-longwing-caterpillar.jpg',     query: 'zebra longwing caterpillar passionvine' },

  // Monarch
  { file: 'monarch.jpg',                        query: 'monarch butterfly orange black' },
  { file: 'monarch-caterpillar.jpg',            query: 'monarch caterpillar milkweed striped' },

  // Queen
  { file: 'queen.jpg',                          query: 'queen butterfly danaus gilippus' },
  { file: 'queen-caterpillar.jpg',              query: 'queen butterfly caterpillar milkweed' },

  // Gulf Fritillary
  { file: 'gulf-fritillary.jpg',                query: 'gulf fritillary butterfly orange' },
  { file: 'gulf-fritillary-caterpillar.jpg',    query: 'gulf fritillary caterpillar orange spines' },

  // Julia Heliconian
  { file: 'julia-heliconian.jpg',               query: 'julia heliconian butterfly orange tropical' },
  { file: 'julia-heliconian-caterpillar.jpg',   query: 'heliconian butterfly caterpillar passionvine' },

  // Giant Swallowtail
  { file: 'giant-swallowtail.jpg',              query: 'giant swallowtail butterfly papilio cresphontes' },
  { file: 'giant-swallowtail-caterpillar.jpg',  query: 'orange dog caterpillar citrus bird dropping' },

  // Eastern Tiger Swallowtail
  { file: 'eastern-tiger-swallowtail.jpg',      query: 'eastern tiger swallowtail butterfly yellow' },
  { file: 'eastern-tiger-swallowtail-caterpillar.jpg', query: 'tiger swallowtail caterpillar green eyespots' },

  // Black Swallowtail
  { file: 'black-swallowtail.jpg',              query: 'black swallowtail butterfly papilio polyxenes' },
  { file: 'black-swallowtail-caterpillar.jpg',  query: 'black swallowtail caterpillar parsley green' },

  // Polydamas Swallowtail
  { file: 'polydamas-swallowtail.jpg',          query: 'polydamas swallowtail butterfly battus' },
  { file: 'polydamas-swallowtail-caterpillar.jpg', query: 'pipevine swallowtail caterpillar aristolochia' },

  // Palamedes Swallowtail
  { file: 'palamedes-swallowtail.jpg',          query: 'palamedes swallowtail butterfly' },
  { file: 'palamedes-swallowtail-caterpillar.jpg', query: 'swallowtail caterpillar eyespots green bay' },

  // Spicebush Swallowtail
  { file: 'spicebush-swallowtail.jpg',          query: 'spicebush swallowtail butterfly blue green' },
  { file: 'spicebush-swallowtail-caterpillar.jpg', query: 'spicebush swallowtail caterpillar eyespots snake' },

  // Cloudless Sulphur
  { file: 'cloudless-sulphur.jpg',              query: 'cloudless sulphur butterfly yellow phoebis' },
  { file: 'cloudless-sulphur-caterpillar.jpg',  query: 'sulphur caterpillar cassia senna yellow' },

  // Orange-barred Sulphur
  { file: 'orange-barred-sulphur.jpg',          query: 'orange barred sulphur butterfly phoebis philea' },
  { file: 'orange-barred-sulphur-caterpillar.jpg', query: 'sulphur butterfly caterpillar cassia' },

  // White Peacock
  { file: 'white-peacock.jpg',                  query: 'white peacock butterfly anartia jatrophae' },
  { file: 'white-peacock-caterpillar.jpg',      query: 'white peacock caterpillar spines black' },

  // Atala
  { file: 'atala.jpg',                          query: 'atala butterfly eumaeus blue green' },
  { file: 'atala-caterpillar.jpg',              query: 'atala caterpillar red yellow coontie' },

  // Painted Lady
  { file: 'painted-lady.jpg',                   query: 'painted lady butterfly vanessa cardui' },
  { file: 'painted-lady-caterpillar.jpg',       query: 'painted lady caterpillar thistle spiny' },

  // American Lady
  { file: 'american-lady.jpg',                  query: 'american lady butterfly vanessa virginiensis' },
  { file: 'american-lady-caterpillar.jpg',      query: 'american lady caterpillar spiny black' },

  // Red Admiral
  { file: 'red-admiral.jpg',                    query: 'red admiral butterfly vanessa atalanta' },
  { file: 'red-admiral-caterpillar.jpg',        query: 'red admiral caterpillar nettle spiny' },

  // Viceroy
  { file: 'viceroy.jpg',                        query: 'viceroy butterfly limenitis archippus monarch mimic' },
  { file: 'viceroy-caterpillar.jpg',            query: 'viceroy butterfly caterpillar willow bird dropping' },

  // Great Southern White
  { file: 'great-southern-white.jpg',           query: 'great southern white butterfly ascia monuste' },
  { file: 'great-southern-white-caterpillar.jpg', query: 'cabbage white caterpillar brassica yellow stripes' },

  // Cassius Blue
  { file: 'cassius-blue.jpg',                   query: 'cassius blue butterfly leptotes' },
  { file: 'cassius-blue-caterpillar.jpg',       query: 'blue butterfly caterpillar plumbago legume' },

  // Gray Hairstreak
  { file: 'gray-hairstreak.jpg',                query: 'gray hairstreak butterfly strymon melinus' },
  { file: 'gray-hairstreak-caterpillar.jpg',    query: 'hairstreak caterpillar bean legume slug shaped' },

  // Long-tailed Skipper
  { file: 'long-tailed-skipper.jpg',            query: 'long tailed skipper butterfly urbanus proteus' },
  { file: 'long-tailed-skipper-caterpillar.jpg',query: 'bean leafroller caterpillar green yellow' },

  // Common Buckeye
  { file: 'common-buckeye.jpg',                 query: 'common buckeye butterfly junonia eyespots' },
  { file: 'common-buckeye-caterpillar.jpg',     query: 'buckeye caterpillar spiny black orange stripe' },
];

// Output directory
const outDir = path.join(__dirname, 'public', 'images', 'butterflies');
fs.mkdirSync(outDir, { recursive: true });

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
  console.log(`\n🦋 Merida's Garden — Downloading ${items.length} butterfly images from Pixabay\n`);
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
  console.log('\n🦋 Done! Images saved to: public/images/butterflies/\n');
  console.log('Note: Pixabay may not have a species-specific image for every entry.');
  console.log('For any that failed or look wrong, drop a replacement JPG into that folder manually.');
  console.log('\nRefresh your browser to see them on the site.\n');
}

run();
