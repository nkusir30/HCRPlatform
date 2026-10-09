// Install bcryptjs from the npm registry without npm/pnpm.
// Usage: node scripts/install-bcryptjs.js <target-dir>  (e.g. hcr-platform/apps/api)
// Downloads the bcryptjs tarball, extracts dist/bcrypt.js + index.d.ts into node_modules/bcryptjs.
const https = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const targetDir = path.resolve(process.argv[2] || 'hcr-platform/apps/api');
const destDir = path.join(targetDir, 'node_modules', 'bcryptjs');

function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 15000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(getJson(res.headers.location));
      }
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode + ' for ' + url));
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function download(url, file) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 30000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return resolve(download(res.headers.location, file));
      }
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
      const out = fs.createWriteStream(file);
      res.pipe(out);
      out.on('finish', () => resolve());
      out.on('error', reject);
    }).on('error', reject);
  });
}

// Minimal tar parser: returns [{name, data}] for regular files.
function parseTar(buf) {
  const files = [];
  let off = 0;
  while (off + 512 <= buf.length) {
    const name = buf.toString('utf8', off, off + 100).replace(/\0.*$/, '');
    if (!name) break;
    const size = parseInt(buf.toString('utf8', off + 124, off + 136).replace(/\0.*$/, '').trim(), 8) || 0;
    const type = String.fromCharCode(buf[off + 156]);
    const start = off + 512;
    if (type === '0' || type === '\0') files.push({ name, data: buf.subarray(start, start + size) });
    off = start + Math.ceil(size / 512) * 512;
  }
  return files;
}

(async () => {
  console.log('target:', destDir);
  const meta = await getJson('https://registry.npmjs.org/bcryptjs/latest');
  console.log('bcryptjs version:', meta.version, 'tarball:', meta.dist.tarball);
  const tmp = path.join(targetDir, 'node_modules', '.bcryptjs.tgz');
  await download(meta.dist.tarball, tmp);
  const raw = fs.readFileSync(tmp);
  const ungz = zlib.gunzipSync(raw);
  const files = parseTar(ungz);
  fs.mkdirSync(path.join(destDir, 'dist'), { recursive: true });
  fs.mkdirSync(path.join(destDir, 'umd'), { recursive: true });
  for (const f of files) {
    const base = path.basename(f.name);
    const dir = path.dirname(f.name);
    if (base === 'index.js' && dir.endsWith('package')) {
      fs.writeFileSync(path.join(destDir, 'dist', 'bcrypt.js'), f.data);
      console.log('wrote dist/bcrypt.js', f.data.length);
    } else if (base === 'index.js' && dir.endsWith('umd')) {
      fs.writeFileSync(path.join(destDir, 'umd', 'index.js'), f.data);
      console.log('wrote umd/index.js', f.data.length);
    } else if (base === 'types.d.ts') {
      fs.writeFileSync(path.join(destDir, dir.endsWith('umd') ? 'umd' : '.', 'types.d.ts'), f.data);
    } else if (base === 'index.d.ts' || base === 'bcrypt.d.ts') {
      if (f.data.length > 200) {
        fs.writeFileSync(path.join(destDir, 'index.d.ts'), f.data);
        console.log('wrote index.d.ts', f.data.length);
      }
    } else if (base === 'package.json' && !dir.endsWith('umd')) {
      const pkg = JSON.parse(f.data.toString('utf8'));
      fs.writeFileSync(
        path.join(destDir, 'package.json'),
        JSON.stringify({ name: pkg.name, version: pkg.version, description: pkg.description, main: 'dist/bcrypt.js', types: 'index.d.ts', license: pkg.license }, null, 2),
      );
      console.log('wrote package.json', pkg.version);
    } else if (base === 'LICENSE' || base === 'LICENSE.md' || base === 'README.md' || base === 'bcrypt') {
      fs.writeFileSync(path.join(destDir, base), f.data, { mode: base === 'bcrypt' ? 0o755 : 0o644 });
    }
  }
  fs.unlinkSync(tmp);
  // sanity: require it
  const b = require(path.join(destDir, 'dist', 'bcrypt.js'));
  const h = b.hashSync('test', 4);
  if (!b.compareSync('test', h)) throw new Error('bcryptjs self-test failed');
  console.log('OK: bcryptjs installed + self-test passed');
})().catch((e) => {
  console.error('FAIL:', e.message);
  process.exit(1);
});
