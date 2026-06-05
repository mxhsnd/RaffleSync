const channel = new BroadcastChannel('raffle-sync');
const state = {
  currentRound: 'NORMAL_A',
  normalRolling: false,
  deanWinners: new Map(),
  interactiveExcludedIds: new Set(),
  normalRevealTimer: null,
  pendingTimers: new Set()
};

const roundLabels = {
  NORMAL_A: '毕业晚会前期预热活动抽奖',
  NORMAL_B: '毕业晚会互动抽奖',
  DEAN_DRAW: '毕业晚会学院特殊礼物抽奖'
};

const REVEAL_DELAY = 3170;

const statusText = document.querySelector('#statusText');
const normalPanel = document.querySelector('#normalPanel');
const deanPanel = document.querySelector('#deanPanel');
const normalCount = document.querySelector('#normalCount');
const normalWinners = document.querySelector('#normalWinners');
const deanControls = document.querySelector('#deanControls');
const interactiveExcludeOption = document.querySelector('#interactiveExcludeOption');
const interactiveExcludeToggle = document.querySelector('#interactiveExcludeToggle');
const raffleSound = document.querySelector('#raffleSound');

function send(message) {
  channel.postMessage(message);
}

function updateStatus(text) {
  statusText.textContent = text;
}

function playRaffleSound() {
  if (!raffleSound) return;
  raffleSound.pause();
  raffleSound.currentTime = 0;
  raffleSound.play().catch(() => {});
}

function stopRaffleSound() {
  if (!raffleSound) return;
  raffleSound.pause();
  raffleSound.currentTime = 0;
}

function switchRound(round) {
  state.currentRound = round;
  normalPanel.classList.toggle('hidden', round === 'DEAN_DRAW');
  deanPanel.classList.toggle('hidden', round !== 'DEAN_DRAW');
  interactiveExcludeOption.classList.toggle('hidden', round !== 'NORMAL_B');
  updateStatus(`当前环节：${roundLabels[round]}`);
  send({ action: 'SWITCH_ROUND', round, roundLabel: roundLabels[round] });
}

function pickRandom(list, count) {
  const pool = [...list];
  const winners = [];
  while (winners.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    winners.push(pool.splice(index, 1)[0]);
  }
  return winners;
}

function availableStudents() {
  return studentData.filter((student) => !student.isDrawn);
}

function availableCollegeStudents(college) {
  return studentData.filter((student) => student.college === college && !student.isDrawn);
}

function availableNormalStudents() {
  return studentData.filter((student) => {
    if (student.isDrawn) return false;
    return state.currentRound !== 'NORMAL_B' || !state.interactiveExcludedIds.has(student.studentId);
  });
}

function renderNormalWinners(winners) {
  normalWinners.innerHTML = winners.map((winner) => `
    <article class="glass-card p-4">
      <p class="text-xl font-black text-white">${winner.name}</p>
      <p class="text-sm text-amber-100/85">${winner.college}</p>
      <p class="text-xs text-white/50">${winner.className} · ${winner.studentId}</p>
    </article>
  `).join('');
}

function clearNormalRevealTimer() {
  if (state.normalRevealTimer) {
    window.clearTimeout(state.normalRevealTimer);
    state.normalRevealTimer = null;
  }
}

function startNormal() {
  const count = Math.max(1, Number(normalCount.value) || 1);
  clearNormalRevealTimer();
  state.normalRolling = true;
  updateStatus(`${roundLabels[state.currentRound]} 正在滚动，目标 ${count} 人，将自动开奖。`);
  playRaffleSound();
  send({ action: 'START_ROLL_NORMAL', count, round: state.currentRound, roundLabel: roundLabels[state.currentRound] });
  state.normalRevealTimer = window.setTimeout(() => {
    state.normalRevealTimer = null;
    stopNormal();
  }, REVEAL_DELAY);
}

function stopNormal() {
  clearNormalRevealTimer();
  const count = Math.max(1, Number(normalCount.value) || 1);
  const winners = pickRandom(availableNormalStudents(), count);
  const shouldExcludeInteractive = state.currentRound === 'NORMAL_B' && interactiveExcludeToggle.checked;
  winners.forEach((winner) => {
    if (state.currentRound === 'NORMAL_B') {
      if (shouldExcludeInteractive) {
        state.interactiveExcludedIds.add(winner.studentId);
      }
      return;
    }
    winner.isDrawn = true;
  });
  state.normalRolling = false;
  renderNormalWinners(winners);
  const remainingCount = state.currentRound === 'NORMAL_B' ? availableNormalStudents().length : availableStudents().length;
  const excludeText = shouldExcludeInteractive ? '，本次互动中奖人已排除下一次互动抽奖' : '';
  updateStatus(`${roundLabels[state.currentRound]} 已开奖 ${winners.length} 人，剩余 ${remainingCount} 人${excludeText}。`);
  send({ action: 'STOP_ROLL_NORMAL', winners, round: state.currentRound, roundLabel: roundLabels[state.currentRound] });
}

function drawDean(college) {
  const [winner] = pickRandom(availableCollegeStudents(college), 1);
  if (!winner) {
    updateStatus(`${college} 已无可抽取学生。`);
    return;
  }
  winner.isDrawn = true;
  state.deanWinners.set(college, winner);
  updateDeanControls();
  updateStatus(`${college} 抽中：${winner.name}`);
  playRaffleSound();
  send({ action: 'START_ROLL_DEAN', college });
  const timer = window.setTimeout(() => {
    state.pendingTimers.delete(timer);
    send({ action: 'STOP_ROLL_DEAN', college, winner });
  }, REVEAL_DELAY);
  state.pendingTimers.add(timer);
}

function rerollDean(college) {
  const previousWinner = state.deanWinners.get(college);
  if (!previousWinner) {
    drawDean(college);
    return;
  }
  const original = studentData.find((student) => student.studentId === previousWinner.studentId);
  if (original) {
    original.isDrawn = false;
  }
  send({ action: 'REROLL_DEAN', college, previousWinnerId: previousWinner.studentId });
  window.setTimeout(() => drawDean(college), 350);
}

function resetDisplay() {
  stopRaffleSound();
  clearNormalRevealTimer();
  state.pendingTimers.forEach((timer) => window.clearTimeout(timer));
  state.pendingTimers.clear();
  studentData.forEach((student) => {
    student.isDrawn = false;
  });
  state.currentRound = 'NORMAL_A';
  state.normalRolling = false;
  state.deanWinners.clear();
  state.interactiveExcludedIds.clear();
  interactiveExcludeToggle.checked = false;
  normalWinners.innerHTML = '';
  normalCount.value = 10;
  updateDeanControls();
  normalPanel.classList.remove('hidden');
  deanPanel.classList.add('hidden');
  updateStatus('已清理缓存，前端展示已恢复初始状态。');
  send({ action: 'RESET_DISPLAY' });
}

function updateDeanControls() {
  deanControls.innerHTML = colleges.map((college) => {
    const winner = state.deanWinners.get(college.name);
    return `
      <article class="glass-card p-4 space-y-4">
        <div>
          <h3 class="text-lg font-black text-white">${college.shortName}</h3>
          <p class="text-xs text-white/50">剩余 ${availableCollegeStudents(college.name).length} 人</p>
        </div>
        <div class="min-h-20 rounded-xl border border-white/10 bg-white/5 p-3">
          <p class="text-sm text-white/50">当前中奖</p>
          <p class="mt-1 text-xl font-black gold-text">${winner ? winner.name : '未抽取'}</p>
          <p class="text-xs text-white/50">${winner ? winner.studentId : ''}</p>
        </div>
        <div class="grid gap-2">
          <button data-draw-college="${college.name}" class="admin-button rounded-xl bg-red-600 px-4 py-2 font-black text-amber-50">抽取</button>
          <button data-reroll-college="${college.name}" class="admin-button rounded-xl bg-amber-400 px-4 py-2 font-black text-red-950" ${winner ? '' : 'disabled'}>重抽</button>
        </div>
      </article>
    `;
  }).join('');
}

document.querySelectorAll('.round-btn').forEach((button) => {
  button.addEventListener('click', () => switchRound(button.dataset.round));
});

document.querySelector('#startNormal').addEventListener('click', startNormal);
document.querySelector('#stopNormal').addEventListener('click', stopNormal);
document.querySelector('#returnHome').addEventListener('click', resetDisplay);
document.querySelector('#resetDisplay').addEventListener('click', resetDisplay);

deanControls.addEventListener('click', (event) => {
  const drawCollege = event.target.dataset.drawCollege;
  const rerollCollege = event.target.dataset.rerollCollege;
  if (drawCollege) {
    drawDean(drawCollege);
  }
  if (rerollCollege) {
    rerollDean(rerollCollege);
  }
});

updateDeanControls();
switchRound('NORMAL_A');
