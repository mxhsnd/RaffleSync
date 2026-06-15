const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = __dirname;

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function getFunctionBody(source, functionName) {
  const start = source.indexOf(`function ${functionName}()`);
  assert.notEqual(start, -1, `${functionName} should exist`);
  const bodyStart = source.indexOf('{', start);
  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth === 0) return source.slice(bodyStart + 1, index);
  }
  assert.fail(`${functionName} body should close`);
}

test('specified-people.json starts as an editable empty shortcut list', () => {
  const payload = JSON.parse(read('specified-people.json'));

  assert.deepEqual(payload, { people: [] });
});

test('admin panel includes quick specified-person fill controls', () => {
  const adminHtml = read('admin.html');

  assert.match(adminHtml, /id="specifiedQuickNumber"/, 'admin should include the shortcut number input');
  assert.match(adminHtml, /id="applySpecifiedQuickPerson"/, 'admin should include the shortcut fill button');
  assert.match(adminHtml, /id="specifiedQuickStatus"/, 'admin should include shortcut status text');
  assert.match(adminHtml, />快捷填充</, 'shortcut controls should be labelled as fill-only UI');
});

test('control script loads shortcuts and only fills existing specified inputs', () => {
  const controlJs = read('control.js');

  assert.match(controlJs, /fetch\('specified-people\.json'\)/, 'control should load the root shortcut JSON');
  assert.match(controlJs, /function normalizeSpecifiedPeople\(rawData\)/, 'control should normalize shortcut entries');
  assert.match(controlJs, /function findSpecifiedPersonByNumber\(number\)/, 'control should find entries by explicit number');
  assert.match(controlJs, /function applySpecifiedQuickPerson\(\)/, 'control should apply a shortcut entry');
  assert.match(controlJs, /specifiedDeanName\.value = person\.name;/, 'shortcut should fill the existing name input');
  assert.match(controlJs, /specifiedDeanClass\.value = person\.className;/, 'shortcut should fill the existing class input');

  const applyBody = getFunctionBody(controlJs, 'applySpecifiedQuickPerson');
  assert.doesNotMatch(applyBody, /specifiedDeanToggle\.checked\s*=\s*true/, 'shortcut apply must not auto-enable specified mode');
  assert.doesNotMatch(applyBody, /startDeanRolling\(/, 'shortcut apply must not start rolling');
  assert.doesNotMatch(applyBody, /drawDean\(/, 'shortcut apply must not draw');
  assert.doesNotMatch(applyBody, /revealDeanWinner\(/, 'shortcut apply must not reveal a winner');
  assert.doesNotMatch(applyBody, /send\(/, 'shortcut apply must not broadcast draw messages');
  assert.match(controlJs, /loadSpecifiedPeople\(\);/, 'shortcut loading should be independent from raffleDataReady');
});
