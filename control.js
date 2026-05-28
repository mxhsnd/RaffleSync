const channel = new BroadcastChannel('raffle-sync');
const state = {
  currentRound: 'NORMAL_A',
  normalRolling: false,
  deanWinners: new Map()
};

const roundLabels = {
  NORMAL_A: '常规抽奖 A',
  NORMAL_B: '常规抽奖 B',
  DEAN_DRAW: '院长特定纪念品抽奖'
};

const statusText = document.querySelector('#statusText');
const normalPanel = document.querySelector('#normalPanel');
const deanPanel = document.querySelector('#deanPanel');
const normalCount = document.querySelector('#normalCount');
const normalWinners = document.querySelector('#normalWinners');
const deanControls = document.querySelector('#deanControls');

function send(message) {
  channel.postMessage(message);
}

function updateStatus(text) {
  statusText.textContent = text;
}

function switchRound(round) {
  state.currentRound = round;
  normalPanel.classList.toggle('hidden', round === 'DEAN_DRAW');
  deanPanel.classList.toggle('hidden', round !== 'DEAN_DRAW');
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

function renderNormalWinners(winners) {
  normalWinners.innerHTML = winners.map((winner) => `
    <article class="glass-card p-4">
      <p class="text-xl font-black text-white">${winner.name}</p>
      <p class="text-sm text-cyan-100/80">${winner.college}</p>
      <p class="text-xs text-white/50">${winner.className} · ${winner.studentId}</p>
    </article>
  `).join('');
}

function startNormal() {
  const count = Math.max(1, Number(normalCount.value) || 1);
  state.normalRolling = true;
  updateStatus(`${roundLabels[state.currentRound]} 正在滚动，目标 ${count} 人。`);
  send({ action: 'START_ROLL_NORMAL', count, round: state.currentRound, roundLabel: roundLabels[state.currentRound] });
}

function stopNormal() {
  const count = Math.max(1, Number(normalCount.value) || 1);
  const winners = pickRandom(availableStudents(), count);
  winners.forEach((winner) => {
    winner.isDrawn = true;
  });
  state.normalRolling = false;
  renderNormalWinners(winners);
  updateStatus(`${roundLabels[state.currentRound]} 已开奖 ${winners.length} 人，剩余 ${availableStudents().length} 人。`);
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
  send({ action: 'START_ROLL_DEAN', college });
  window.setTimeout(() => send({ action: 'STOP_ROLL_DEAN', college, winner }), 900);
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
          <button data-draw-college="${college.name}" class="admin-button rounded-xl bg-cyan-500 px-4 py-2 font-black text-slate-950">抽取</button>
          <button data-reroll-college="${college.name}" class="admin-button rounded-xl bg-amber-400 px-4 py-2 font-black text-slate-950" ${winner ? '' : 'disabled'}>重抽</button>
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
