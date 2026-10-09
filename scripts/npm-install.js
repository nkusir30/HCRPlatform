// Install web deps by invoking npm's JS CLI directly (bypasses the broken
// npm.ps1 / npm.cmd shims on this machine). Usage: node scripts/npm-install.js <dir>
const { spawnSync } = require('child_process');
const path = require('path');

const dir = process.argv[2];
if (!dir) { console.error('usage: node npm-install.js <dir>'); process.exit(2); }

const npmCli = path.join('C:\\Program Files', 'nodejs', 'node_modules', 'npm', 'bin', 'npm-cli.js');
console.log('npm-cli:', npmCli);
console.log('cwd:', path.resolve(dir));

const res = spawnSync(process.execPath, [npmCli, 'install', '--no-audit', '--no-fund', '--cache', path.join(process.env.TEMP || 'C:/Windows/Temp', 'hcr-npm-cache')], {
  cwd: path.resolve(dir),
  encoding: 'utf8',
  maxBuffer: 1024 * 1024 * 32,
});

const tail = (s) => (s || '').split('\n').slice(-30).join('\n');
console.log('--- STDOUT tail ---\n' + tail(res.stdout));
if (res.stderr) console.log('--- STDERR tail ---\n' + tail(res.stderr));
console.log('exit:', res.status);
process.exit(res.status ?? 1);
