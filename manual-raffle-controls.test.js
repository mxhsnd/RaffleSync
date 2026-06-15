const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = __dirname;

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('normal and dean draws use explicit manual controls', () => {
  const adminHtml = read('admin.html');
  const controlJs = read('control.js');
  const displayJs = read('display.js');
  const indexHtml = read('index.html');

  assert.match(adminHtml, /id="startNormal"/, 'normal draw should still have a start button');
  assert.match(adminHtml, /id="stopNormal"[^>]*>开奖</, 'normal draw reveal button should be labelled 开奖');
  assert.doesNotMatch(adminHtml, /自动开奖/, 'normal draw should no longer mention auto reveal');
  assert.doesNotMatch(adminHtml, /id="raffleSound"/, 'admin page should not include audio element');
  assert.doesNotMatch(indexHtml, /id="enableSound"/, 'display page should not include audio enable button');

  assert.match(controlJs, /deanPendingWinners: new Map\(\)/, 'control state should track dean pending winners separately');
  assert.doesNotMatch(controlJs, /normalRevealTimer/, 'normal draw should not use auto reveal timer anymore');
  assert.doesNotMatch(controlJs, /setTimeout\(\(\) => \{[\s\S]*?stopNormal\(\)/, 'normal draw should not auto reveal after a timeout');
  assert.match(controlJs, /send\(\{ action: 'START_ROLL_NORMAL', count: drawCount, round, roundLabel: roundLabels\[round\] \}\);/, 'normal start should only start rolling');
  assert.match(controlJs, /send\(\{ action: 'STOP_ROLL_NORMAL', winners, round, roundLabel: roundLabels\[round\] \}\);/, 'normal reveal should happen only on explicit stop');
  assert.match(controlJs, /send\(\{ action: 'START_ROLL_DEAN', college \}\);/, 'dean start should only begin rolling');
  assert.match(controlJs, /send\(\{ action: 'STOP_ROLL_DEAN', college, winner \}\);/, 'dean reveal should happen on explicit stop');
  assert.match(controlJs, /function startDeanRolling\(college\)/, 'each dean draw should have an explicit start action');
  assert.match(controlJs, /function revealDeanWinner\(college\)/, 'each dean draw should have an explicit reveal action');

  assert.doesNotMatch(displayJs, /playRaffleSound\(/, 'display should no longer play raffle audio');
  assert.doesNotMatch(displayJs, /raffleSound/, 'display should no longer depend on audio elements');
});
