// Targeted image fix using Unsplash API (better plant/disease photos)
// Unsplash Client ID (free, no credit card): uses demo key with low rate limit
// Falls back to Pixabay if Unsplash finds nothing.

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PIXABAY_KEY = '55430627-49324529e03a6beb384866d80';

// Direct Wikimedia Commons image URLs (public domain)
// Using Special:Redirect which resolves to the real image URL automatically
const DIRECT_URLS = {
  'powdery-mildew.jpg':  'https://commons.wikimedia.org/wiki/Special:Redirect/file/Powdery_mildew.JPG?width=800',
  'root-rot.jpg':        'https://commons.wikimedia.org/wiki/Special:Redirect/file/Pineapple_root_rot_phytophthora_cinnamomi_(5829323399).jpg?width=800',
  'squash-blossoms.jpg': 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Cucurbita_pepo_Zucchini_flower_and_plant.jpg?width=800',
};

// Pixabay fallback queries if Wikimedia fails
const PIXABAY_FALLBACK = {
  'powdery-mildew.jpg':  'white mildew leaf plant disease garden close',
  'root-rot.jpg':        'plant roots brown damage wilting soil',
  'squash-blossoms.jpg': 'zucchini courgette flower yellow blossom open',
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    const req = proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        try { fs.unlinkSync(destPath); } catch {}
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(destPath); } catch {}
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
      file.on('error', err => { try { fs.unlinkSync(destPath); } catch {} reject(err); });
    });
    req.on('error', err => { try { fs.unlinkSync(destPath); } catch {} reject(err); });
  });
}

function pixabaySearch(query) {
  return new Promise((resolve, reject) => {
    const q = encodeURIComponent(query);
    const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${q}&image_type=photo&per_page=5&safesearch=true&orientation=horizontal&min_width=400`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data).hits || []); } catch(e) { reject(e); } });
    }).on('error', reject);
  });
}

async function fixImage(filename, folder) {
  const destDir  = path.join(__dirname, 'public', 'images', folder);
  const destPath = path.join(destDir, filename);

  // Remove wrong existing file
  if (fs.existsSync(destPath)) {
    fs.unlinkSync(destPath);
    console.log(`  🗑  Removed: ${filename}`);
  }

  // Try direct Wikimedia URL first
  if (DIRECT_URLS[filename]) {
    console.log(`  ⬇️  Trying Wikimedia Commons...`);
    try {
      await downloadFile(DIRECT_URLS[filename], destPath);
      const size = Math.round(fs.statSync(destPath).size / 1024);
      if (size < 5) throw new Error('File too small — probably an error page');
      console.log(`  ✅ Success from Wikimedia: ${filename} (${size} KB)\n`);
      return true;
    } catch (err) {
      console.log(`     Wikimedia failed: ${err.message}`);
      try { fs.unlinkSync(destPath); } catch {}
    }
  }

  // Pixabay fallback
  if (PIXABAY_FALLBACK[filename]) {
    console.log(`  🔍 Trying Pixabay fallback: "${PIXABAY_FALLBACK[filename]}"`);
    await sleep(1200);
    try {
      const hits = await pixabaySearch(PIXABAY_FALLBACK[filename]);
      const hit = hits.find(h => h.webformatURL);
      if (hit) {
        await downloadFile(hit.webformatURL, destPath);
        console.log(`  ✅ Success from Pixabay: ${filename}`);
        console.log(`     Tags: ${hit.tags}\n`);
        return true;
      }
    } catch (err) {
      console.log(`     Pixabay failed: ${err.message}`);
    }
  }

  console.log(`  ❌ Could not fix: ${filename}\n`);
  return false;
}

async function run() {
  console.log('\n🔧 Fixing 3 images: powdery-mildew, root-rot, squash-blossoms\n');
  console.log('─'.repeat(55));

  await fixImage('powdery-mildew.jpg', 'pests');
  await fixImage('root-rot.jpg',       'pests');
  await fixImage('squash-blossoms.jpg','plants');

  console.log('─'.repeat(55));
  console.log('\nDone! Refresh your browser to see the updated photos.\n');
}

run();
