const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = __dirname;

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('data.js loads the roster from event-data.json instead of generating fake students', () => {
  const dataJs = read('data.js');

  assert.match(dataJs, /fetch\(['"]event-data\.json['"]\)/, 'data.js should fetch event-data.json');
  assert.match(dataJs, /window\.raffleDataReady\s*=/, 'data.js should expose raffleDataReady');
  assert.match(dataJs, /window\.studentData\s*=/, 'data.js should populate window.studentData');
  assert.match(dataJs, /isDrawn:\s*false/, 'data.js should add runtime isDrawn state after loading JSON');
  assert.doesNotMatch(dataJs, /familyNames|givenNames|Array\.from\(\{\s*length:\s*600\s*\}\)/, 'data.js should not generate random fake roster data');
});

test('admin and display scripts wait for raffleDataReady before initialization', () => {
  const controlJs = read('control.js');
  const displayJs = read('display.js');
  const adminHtml = read('admin.html');

  assert.match(controlJs, /window\.raffleDataReady\.then\(initializeAdmin\)/, 'control.js should initialize after data is ready');
  assert.match(controlJs, /catch\(handleDataLoadError\)/, 'control.js should show load errors');
  assert.match(displayJs, /window\.raffleDataReady\.then\(initializeDisplay\)/, 'display.js should initialize after data is ready');
  assert.match(adminHtml, /正在加载活动名单/, 'admin.html should not claim 3000 generated students before loading JSON');
});
