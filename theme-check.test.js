const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = __dirname;
const files = ['styles.css', 'index.html', 'admin.html', 'control.js', 'display.js', 'data.js'];
const contents = Object.fromEntries(
  files.map((file) => [file, fs.readFileSync(path.join(root, file), 'utf8')])
);
const combined = Object.values(contents).join('\n');

function imageDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  const isPng = buffer.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (isPng) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20)
    };
  }

  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) break;
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return {
        width: buffer.readUInt16BE(offset + 7),
        height: buffer.readUInt16BE(offset + 5)
      };
    }
    offset += 2 + length;
  }
  throw new Error(`Could not read image dimensions for ${filePath}`);
}

assert.match(
  contents['styles.css'],
  /background-image:\s*url\(['"]图片\/32背景\.png['"]\)/,
  'display background should use the 3:2 图片/32背景.png source'
);

const backgroundSize = imageDimensions(path.join(root, '图片', '32背景.png'));
assert.ok(
  Math.abs(backgroundSize.width / backgroundSize.height - 1.5) < 0.01,
  `background should be close to 3:2, got ${backgroundSize.width}x${backgroundSize.height}`
);

assert.match(
  contents['styles.css'],
  /\.stage-bg\s*\{[\s\S]*?height:\s*205vh;[\s\S]*?background-position:\s*center bottom;[\s\S]*?transform:\s*translate3d\(0, calc\(-100% \+ 100vh\), 0\) scale\(1\.02\);[\s\S]*?will-change:\s*transform;/,
  'initial display should show the bottom of the 3:2 background via GPU transform'
);

assert.match(
  contents['styles.css'],
  /body\.raffle-active \.stage-bg\s*\{[\s\S]*?transform:\s*translate3d\(0, 0, 0\) scale\(1\);/,
  'raffle scene should slide the 3:2 background to the top via transform'
);

assert.doesNotMatch(
  contents['styles.css'],
  /transition:\s*[^;]*background-position/,
  'background slide should not animate background-position because it repaints large images'
);

assert.match(contents['index.html'], /class="display-stage[^"]*p-4/, '3:1 display stage should use tighter padding');
assert.match(contents['index.html'], /class="raffle-scene[^"]*p-4/, '3:1 raffle scene should use tighter padding');
assert.match(contents['display.js'], /min-h-\[15rem\]/, 'dean cards should be shorter for 3:1 display');
assert.match(contents['display.js'], /text-xl font-black leading-tight glow-text/, 'dean college title text should be reduced for 3:1 display');
assert.match(contents['display.js'], /data-dean-name="\$\{college\.name\}" class="text-3xl/, 'dean winner name should be reduced for 3:1 display');


assert.doesNotMatch(
  combined,
  /cyan|violet|bg-cyan|text-cyan|border-cyan|focus:border-cyan|#38bdf8|#a855f7/i,
  'red-gold theme should not leave cyan/violet styling tokens behind'
);

assert.match(contents['styles.css'], /--red:\s*#[0-9a-f]{6};/i, 'red theme token should exist');
assert.match(contents['styles.css'], /--gold:\s*#[0-9a-f]{6};/i, 'gold theme token should exist');
assert.match(contents['admin.html'], /bg-red-600/, 'primary admin actions should use red');
assert.match(contents['admin.html'], /bg-amber-400/, 'secondary/admin reveal actions should keep gold');

console.log('theme-check passed');
