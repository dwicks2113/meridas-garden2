// Merida's Garden — Image Downloader
// Uses Pixabay free API to download photos for all plants and pests
// Run with: node download-images.js

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const API_KEY = '55430627-49324529e03a6beb384866d80';

// All 58 images to download
const items = [
  // ── FLOWERS ────────────────────────────────────────────────
  { file: 'bougainvillea.jpg',        folder: 'plants', query: 'bougainvillea pink flowers tropical' },
  { file: 'hibiscus.jpg',             folder: 'plants', query: 'tropical hibiscus red flower' },
  { file: 'pentas.jpg',               folder: 'plants', query: 'pentas lanceolata star flowers' },
  { file: 'ixora.jpg',                folder: 'plants', query: 'ixora orange red flowers tropical shrub' },
  { file: 'lantana.jpg',              folder: 'plants', query: 'lantana camara colorful flowers butterfly' },
  { file: 'firebush.jpg',             folder: 'plants', query: 'hamelia patens firebush red flowers' },
  { file: 'blanket-flower.jpg',       folder: 'plants', query: 'gaillardia blanket flower red yellow' },
  { file: 'scarlet-sage.jpg',         folder: 'plants', query: 'salvia coccinea red sage flowers hummingbird' },
  { file: 'coreopsis.jpg',            folder: 'plants', query: 'coreopsis yellow daisy wildflower' },
  { file: 'agapanthus.jpg',           folder: 'plants', query: 'agapanthus blue purple lily flowers' },

  // ── EDIBLE FLOWERS ─────────────────────────────────────────
  { file: 'nasturtium.jpg',           folder: 'plants', query: 'nasturtium orange yellow edible flower' },
  { file: 'borage.jpg',               folder: 'plants', query: 'borage blue star flower herb' },
  { file: 'squash-blossoms.jpg',      folder: 'plants', query: 'squash blossom orange flower garden' },
  { file: 'roselle.jpg',              folder: 'plants', query: 'roselle hibiscus sabdariffa red calyx' },
  { file: 'mexican-mint-marigold.jpg',folder: 'plants', query: 'tagetes lucida mexican mint marigold yellow' },
  { file: 'okra.jpg',                 folder: 'plants', query: 'okra flower yellow plant garden' },

  // ── VEGETABLES ─────────────────────────────────────────────
  { file: 'tomato.jpg',               folder: 'plants', query: 'tomato plant red ripe garden' },
  { file: 'pepper.jpg',               folder: 'plants', query: 'pepper capsicum plant garden colorful' },
  { file: 'cucumber.jpg',             folder: 'plants', query: 'cucumber plant vine garden green' },
  { file: 'eggplant.jpg',             folder: 'plants', query: 'eggplant aubergine purple garden' },
  { file: 'lettuce.jpg',              folder: 'plants', query: 'lettuce green garden fresh leaves' },
  { file: 'kale.jpg',                 folder: 'plants', query: 'kale green curly leaves garden' },
  { file: 'sweet-potato.jpg',         folder: 'plants', query: 'sweet potato vine garden harvest' },
  { file: 'squash.jpg',               folder: 'plants', query: 'zucchini squash plant garden green' },
  { file: 'swiss-chard.jpg',          folder: 'plants', query: 'swiss chard colorful stems garden' },
  { file: 'spinach.jpg',              folder: 'plants', query: 'spinach fresh green leaves garden' },
  { file: 'carrot.jpg',               folder: 'plants', query: 'carrot orange vegetable garden harvest' },

  // ── FRUITS ─────────────────────────────────────────────────
  { file: 'mango.jpg',                folder: 'plants', query: 'mango tropical fruit tree ripe' },
  { file: 'avocado.jpg',              folder: 'plants', query: 'avocado fruit tree tropical' },
  { file: 'papaya.jpg',               folder: 'plants', query: 'papaya tropical fruit tree yellow' },
  { file: 'banana.jpg',               folder: 'plants', query: 'banana bunch tropical tree plant' },
  { file: 'citrus.jpg',               folder: 'plants', query: 'orange citrus tree fruit ripe' },
  { file: 'pineapple.jpg',            folder: 'plants', query: 'pineapple tropical fruit plant' },
  { file: 'guava.jpg',                folder: 'plants', query: 'guava tropical fruit tree' },
  { file: 'passion-fruit.jpg',        folder: 'plants', query: 'passion fruit vine flower purple' },
  { file: 'lychee.jpg',               folder: 'plants', query: 'lychee red fruit tree tropical' },
  { file: 'dragon-fruit.jpg',         folder: 'plants', query: 'dragon fruit pitaya pink cactus' },

  // ── MEDICINAL PLANTS ───────────────────────────────────────
  { file: 'aloe-vera.jpg',            folder: 'plants', query: 'aloe vera succulent plant green' },
  { file: 'moringa.jpg',              folder: 'plants', query: 'moringa tree leaves tropical' },
  { file: 'turmeric.jpg',             folder: 'plants', query: 'turmeric plant rhizome yellow' },
  { file: 'lemongrass.jpg',           folder: 'plants', query: 'lemongrass herb plant garden' },
  { file: 'ginger.jpg',               folder: 'plants', query: 'ginger plant root garden tropical' },
  { file: 'rosemary.jpg',             folder: 'plants', query: 'rosemary herb plant garden fragrant' },
  { file: 'holy-basil.jpg',           folder: 'plants', query: 'holy basil tulsi plant herb' },
  { file: 'neem.jpg',                 folder: 'plants', query: 'neem tree leaves tropical medicinal' },

  // ── PESTS & DISEASES ───────────────────────────────────────
  { file: 'aphids.jpg',               folder: 'pests',  query: 'aphids insects green plant close up' },
  { file: 'whiteflies.jpg',           folder: 'pests',  query: 'whiteflies plant leaf insect pest' },
  { file: 'spider-mites.jpg',         folder: 'pests',  query: 'spider mites webbing plant leaf damage' },
  { file: 'fungus-gnats.jpg',         folder: 'pests',  query: 'fungus gnats soil small flies' },
  { file: 'scale.jpg',                folder: 'pests',  query: 'scale insects plant stem bark pest' },
  { file: 'caterpillars.jpg',         folder: 'pests',  query: 'green caterpillar hornworm tomato plant' },
  { file: 'slugs-snails.jpg',         folder: 'pests',  query: 'slug snail garden plant pest' },
  { file: 'thrips.jpg',               folder: 'pests',  query: 'thrips insect plant damage pest' },
  { file: 'mealybugs.jpg',            folder: 'pests',  query: 'mealybugs white cottony plant pest' },
  { file: 'asian-citrus-psyllid.jpg', folder: 'pests',  query: 'citrus psyllid insect pest' },
  { file: 'root-rot.jpg',             folder: 'pests',  query: 'root rot plant disease brown roots' },
  { file: 'powdery-mildew.jpg',       folder: 'pests',  query: 'powdery mildew white fungus leaves plant' },

  // ── NEW FLOWERS ──
  { file: 'plumeria.jpg',             folder: 'plants', query: 'plumeria frangipani white pink flowers tropical' },
  { file: 'bird-of-paradise.jpg',     folder: 'plants', query: 'bird of paradise strelitzia orange blue flower' },
  { file: 'plumbago.jpg',             folder: 'plants', query: 'plumbago blue flowers shrub tropical' },
  { file: 'portulaca.jpg',            folder: 'plants', query: 'portulaca moss rose colorful flowers succulent' },
  { file: 'tropical-milkweed.jpg',    folder: 'plants', query: 'tropical milkweed asclepias red yellow butterfly' },
  { file: 'blue-daze.jpg',            folder: 'plants', query: 'blue daze evolvulus blue flowers groundcover' },
  { file: 'turks-cap.jpg',            folder: 'plants', query: 'turks cap malvaviscus red flower hummingbird' },
  { file: 'canna-lily.jpg',           folder: 'plants', query: 'canna lily red orange tropical flower garden' },
  { file: 'crinum-lily.jpg',          folder: 'plants', query: 'crinum lily white fragrant flowers tropical' },
  { file: 'gardenia.jpg',             folder: 'plants', query: 'gardenia white fragrant flower shrub' },
  { file: 'heliconia.jpg',            folder: 'plants', query: 'heliconia lobster claw tropical red orange flower' },
  { file: 'ginger-lily.jpg',          folder: 'plants', query: 'white ginger lily hedychium fragrant flower' },

  // ── NEW VEGETABLES ──
  { file: 'green-beans.jpg',          folder: 'plants', query: 'green beans plant garden fresh pods' },
  { file: 'collard-greens.jpg',       folder: 'plants', query: 'collard greens leafy vegetable garden' },
  { file: 'arugula.jpg',              folder: 'plants', query: 'arugula rocket leaves garden fresh green' },
  { file: 'radish.jpg',               folder: 'plants', query: 'radish red root vegetable garden harvest' },
  { file: 'broccoli.jpg',             folder: 'plants', query: 'broccoli head green vegetable garden' },
  { file: 'scallions.jpg',            folder: 'plants', query: 'green onions scallions garden fresh' },
  { file: 'pigeon-peas.jpg',          folder: 'plants', query: 'pigeon peas cajanus pods tropical plant' },
  { file: 'bitter-melon.jpg',         folder: 'plants', query: 'bitter melon bitter gourd green warty fruit' },
  { file: 'chayote.jpg',              folder: 'plants', query: 'chayote green pear shaped vegetable vine' },
  { file: 'cassava.jpg',              folder: 'plants', query: 'cassava yuca root tropical plant' },
  { file: 'beets.jpg',                folder: 'plants', query: 'beets red root vegetable garden harvest' },
  { file: 'snow-peas.jpg',            folder: 'plants', query: 'snow peas sugar snap peas pods vine garden' },
  { file: 'calabaza.jpg',             folder: 'plants', query: 'calabaza pumpkin squash tropical green' },
  { file: 'luffa.jpg',                folder: 'plants', query: 'luffa loofah vine green fruit garden' },

  // ── NEW FRUITS/TREES ──
  { file: 'starfruit.jpg',            folder: 'plants', query: 'starfruit carambola yellow tropical fruit' },
  { file: 'jackfruit.jpg',            folder: 'plants', query: 'jackfruit large tropical fruit tree' },
  { file: 'sapodilla.jpg',            folder: 'plants', query: 'sapodilla brown tropical fruit tree' },
  { file: 'sugar-apple.jpg',          folder: 'plants', query: 'sugar apple annona custard green tropical fruit' },
  { file: 'soursop.jpg',              folder: 'plants', query: 'soursop guanabana spiny green tropical fruit' },
  { file: 'longan.jpg',               folder: 'plants', query: 'longan fruit cluster tropical tree' },
  { file: 'acerola.jpg',              folder: 'plants', query: 'acerola cherry red tropical fruit tree' },
  { file: 'pomegranate.jpg',          folder: 'plants', query: 'pomegranate red fruit tree garden' },
  { file: 'fig.jpg',                  folder: 'plants', query: 'fig fruit tree ripe purple' },
  { file: 'mulberry.jpg',             folder: 'plants', query: 'mulberry fruit tree purple berries' },
  { file: 'tamarind.jpg',             folder: 'plants', query: 'tamarind pods tree tropical' },
  { file: 'coconut-palm.jpg',         folder: 'plants', query: 'coconut palm tree tropical beach' },
  { file: 'noni.jpg',                 folder: 'plants', query: 'noni morinda fruit tropical tree' },
  { file: 'surinam-cherry.jpg',       folder: 'plants', query: 'surinam cherry eugenia red ribbed fruit' },
  { file: 'black-sapote.jpg',         folder: 'plants', query: 'black sapote chocolate pudding fruit tropical' },
];

// Create output directories
const plantsDir = path.join(__dirname, 'public', 'images', 'plants');
const pestsDir  = path.join(__dirname, 'public', 'images', 'pests');
fs.mkdirSync(plantsDir, { recursive: true });
fs.mkdirSync(pestsDir,  { recursive: true });

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
  console.log(`\n🌱 Merida's Garden — Downloading ${items.length} images from Pixabay\n`);
  console.log('─'.repeat(60));

  let success = 0;
  let skipped = 0;
  let failed  = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const destDir  = item.folder === 'plants' ? plantsDir : pestsDir;
    const destPath = path.join(destDir, item.file);

    // Skip if file already exists
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

      // Use the first result with a webformatURL
      const hit = hits.find(h => h.webformatURL) || hits[0];
      const imageUrl = hit.webformatURL;

      await downloadFile(imageUrl, destPath);
      console.log(`  ✅ [${i+1}/${items.length}] ${item.file}`);
      success++;

      // Respectful rate limiting — 1 request per second
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
  console.log('\n🌿 Done! Images saved to:');
  console.log(`   public/images/plants/  (${items.filter(i=>i.folder==='plants').length} images)`);
  console.log(`   public/images/pests/   (${items.filter(i=>i.folder==='pests').length} images)`);
  console.log('\nRefresh your browser to see the photos on the site.\n');
}

run();
