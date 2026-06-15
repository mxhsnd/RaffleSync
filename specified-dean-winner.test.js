const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = __dirname;

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('dean panel includes one-shot specified winner controls', () => {
  const adminHtml = read('admin.html');

  assert.match(adminHtml, /id="specifiedDeanToggle"/, 'dean panel should include specified winner switch');
  assert.match(adminHtml, /id="specifiedDeanName"/, 'dean panel should include specified name input');
  assert.match(adminHtml, /id="specifiedDeanClass"/, 'dean panel should include specified class input');
  assert.match(adminHtml, /id="specifiedDeanStatus"/, 'dean panel should include specified status text');
});

test('control.js creates a one-shot specified dean winner with the next TEMP id', () => {
  const controlJs = read('control.js');

  assert.match(controlJs, /const specifiedDeanToggle = document\.querySelector\('#specifiedDeanToggle'\)/, 'control.js should read specified toggle');
  assert.match(controlJs, /function nextTempStudentId\(\)/, 'control.js should generate the next TEMP id');
  assert.match(controlJs, /TEMP\$\{String\(maxTempNumber \+ 1\)\.padStart\(4, '0'\)\}/, 'next TEMP id should be zero padded and sequential');
  assert.match(controlJs, /function createSpecifiedDeanWinner\(college\)/, 'control.js should create runtime specified winner');
  assert.match(controlJs, /studentData\.push\(specifiedWinner\)/, 'specified winner should be added to runtime studentData');
  assert.match(controlJs, /const specifiedWinner = createSpecifiedDeanWinner\(college\)/, 'dean start should try specified winner first');
  assert.match(controlJs, /specifiedDeanToggle\.checked = false/, 'specified mode should turn off after successful specified draw');
  assert.match(controlJs, /specifiedDeanName\.value = ''/, 'specified name should clear after use or reset');
  assert.match(controlJs, /specifiedDeanClass\.value = ''/, 'specified class should clear after use or reset');
});
