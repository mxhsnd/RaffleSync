const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = __dirname;
const styles = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');

test('dean winner name stays inside the card effect area', () => {
  assert.match(styles, /\.dean-winner-name\s*\{[\s\S]*?font-size:\s*clamp\(2\.2rem,\s*3\.2vw,\s*3\.8rem\);/, 'dean winner name should use a smaller clamp range');
  assert.match(styles, /\.dean-winner-name\s*\{[\s\S]*?line-height:\s*1\.1;/, 'dean winner name should tighten line height');
  assert.match(styles, /\.dean-winner-name\s*\{[\s\S]*?letter-spacing:\s*0\.06em;/, 'dean winner name should reduce letter spacing');
  assert.match(styles, /\.dean-winner-name\s*\{[\s\S]*?max-width:\s*100%;/, 'dean winner name should stay within the card width');
  assert.match(styles, /\.dean-winner-name\s*\{[\s\S]*?overflow-wrap:\s*anywhere;/, 'dean winner name should wrap instead of stretching the card');
});
