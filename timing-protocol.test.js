const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = __dirname;

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

test('control page uses explicit manual reveal protocol for normal and dean draws', () => {
  const controlJs = read('control.js');
  const displayJs = read('display.js');

  assert.doesNotMatch(controlJs, /REVEAL_DELAY/, 'manual draw flow should not use auto reveal delay');
  assert.doesNotMatch(controlJs, /normalRevealTimer/, 'normal draw should not use auto reveal timers');
  assert.doesNotMatch(controlJs, /pendingTimers/, 'dean draw should not use queued auto reveal timers');
  assert.match(controlJs, /send\(\{ action: 'START_ROLL_NORMAL', count: drawCount, round, roundLabel: roundLabels\[round\] \}\);/, 'normal draw should send explicit start message');
  assert.match(controlJs, /send\(\{ action: 'STOP_ROLL_NORMAL', winners, round, roundLabel: roundLabels\[round\] \}\);/, 'normal draw should send explicit reveal message');
  assert.match(controlJs, /function startDeanRolling\(college\)/, 'dean draw should expose explicit start action');
  assert.match(controlJs, /function revealDeanWinner\(college\)/, 'dean draw should expose explicit reveal action');
  assert.match(controlJs, /send\(\{ action: 'START_ROLL_DEAN', college \}\);/, 'dean draw should send explicit start message');
  assert.match(controlJs, /send\(\{ action: 'STOP_ROLL_DEAN', college, winner \}\);/, 'dean draw should send explicit reveal message');

  assert.match(displayJs, /if \(message\.action === 'START_ROLL_NORMAL'\) \{[\s\S]*?startNormalRolling\(message\.count\);[\s\S]*?\}/, 'display START_ROLL_NORMAL handler should only start rolling');
  assert.match(displayJs, /if \(message\.action === 'STOP_ROLL_NORMAL'\) \{[\s\S]*?renderNormalWinners\(message\.winners\);[\s\S]*?\}/, 'display STOP_ROLL_NORMAL handler should reveal normal winners');
  assert.match(displayJs, /if \(message\.action === 'START_ROLL_DEAN'\) \{[\s\S]*?setDeanRolling\(message\.college\);[\s\S]*?\}/, 'display START_ROLL_DEAN handler should only start rolling');
  assert.match(displayJs, /if \(message\.action === 'STOP_ROLL_DEAN'\) \{[\s\S]*?stopDeanRolling\(message\.college \|\| message\.winner\.college, message\.winner\);[\s\S]*?\}/, 'display STOP_ROLL_DEAN handler should reveal dean winners');
});
