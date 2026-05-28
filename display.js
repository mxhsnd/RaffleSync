const channel = new BroadcastChannel('raffle-sync');
const roundTitle = document.querySelector('#roundTitle');
const roundSubtitle = document.querySelector('#roundSubtitle');
const normalDisplay = document.querySelector('#normalDisplay');
const deanDisplay = document.querySelector('#deanDisplay');
const rollingGrid = document.querySelector('#rollingGrid');
const winnerGrid = document.querySelector('#winnerGrid');
const deanCards = document.querySelector('#deanCards');

const displayState = {
  rollingTimer: null,
  deanTimers: new Map()
};

function randomStudent() {
  return studentData[Math.floor(Math.random() * studentData.length)];
}

function showRound(round, roundLabel) {
  roundTitle.textContent = roundLabel || '毕业晚会幸运抽奖';
  roundSubtitle.textContent = round === 'DEAN_DRAW' ? '五大学院轮流揭晓纪念品获得者' : '幸运名单即将揭晓';
  normalDisplay.classList.toggle('hidden', round === 'DEAN_DRAW');
  normalDisplay.classList.toggle('flex', round !== 'DEAN_DRAW');
  deanDisplay.classList.toggle('hidden', round !== 'DEAN_DRAW');
  deanDisplay.classList.toggle('flex', round === 'DEAN_DRAW');
}

function clearNormalRolling() {
  if (displayState.rollingTimer) {
    window.clearInterval(displayState.rollingTimer);
    displayState.rollingTimer = null;
  }
}

function startNormalRolling(count) {
  clearNormalRolling();
  winnerGrid.innerHTML = '';
  rollingGrid.innerHTML = Array.from({ length: Math.min(24, Math.max(12, count * 2)) }, () => '<div class="glass-card rolling-name p-4 text-center text-2xl font-black text-white/90">等待</div>').join('');
  displayState.rollingTimer = window.setInterval(() => {
    rollingGrid.querySelectorAll('div').forEach((node) => {
      const student = randomStudent();
      node.textContent = student.name;
    });
  }, 90);
}

function renderNormalWinners(winners) {
  clearNormalRolling();
  rollingGrid.innerHTML = '';
  winnerGrid.innerHTML = winners.map((winner, index) => `
    <article class="glass-card winner-card glow-border p-5 text-center" style="animation-delay: ${index * 80}ms">
      <p class="text-3xl font-black glow-text">${winner.name}</p>
      <p class="mt-2 text-sm text-cyan-100/85">${winner.college}</p>
      <p class="mt-1 text-xs text-white/55">${winner.className} · ${winner.studentId}</p>
    </article>
  `).join('');
}

function renderDeanCards() {
  deanCards.innerHTML = colleges.map((college) => `
    <article data-college-card="${college.name}" class="glass-card fade-shift min-h-80 p-5 text-center flex flex-col justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-cyan-100/60">College Prize</p>
        <h2 class="mt-3 text-2xl font-black glow-text">${college.shortName}</h2>
      </div>
      <div class="py-8">
        <p data-dean-name="${college.name}" class="text-4xl font-black text-white/60">待揭晓</p>
        <p data-dean-meta="${college.name}" class="mt-3 text-sm text-white/45">等待控制台抽取</p>
      </div>
      <p class="text-xs text-white/40">${college.name}</p>
    </article>
  `).join('');
}

function setDeanRolling(college) {
  const card = deanCards.querySelector(`[data-college-card="${college}"]`);
  const name = deanCards.querySelector(`[data-dean-name="${college}"]`);
  const meta = deanCards.querySelector(`[data-dean-meta="${college}"]`);
  if (!card || !name || !meta) return;
  card.classList.add('dean-card-active');
  meta.textContent = '正在高速滚动';
  if (displayState.deanTimers.has(college)) {
    window.clearInterval(displayState.deanTimers.get(college));
  }
  const timer = window.setInterval(() => {
    name.textContent = randomStudent().name;
  }, 80);
  displayState.deanTimers.set(college, timer);
}

function stopDeanRolling(college, winner) {
  const card = deanCards.querySelector(`[data-college-card="${college}"]`);
  const name = deanCards.querySelector(`[data-dean-name="${college}"]`);
  const meta = deanCards.querySelector(`[data-dean-meta="${college}"]`);
  const timer = displayState.deanTimers.get(college);
  if (timer) {
    window.clearInterval(timer);
    displayState.deanTimers.delete(college);
  }
  if (!card || !name || !meta) return;
  card.classList.remove('dean-card-active');
  name.textContent = winner.name;
  name.classList.add('gold-text');
  meta.textContent = `${winner.className} · ${winner.studentId}`;
}

function handleMessage(message) {
  if (message.action === 'SWITCH_ROUND') {
    showRound(message.round, message.roundLabel);
  }
  if (message.action === 'START_ROLL_NORMAL') {
    showRound(message.round, message.roundLabel);
    startNormalRolling(message.count);
  }
  if (message.action === 'STOP_ROLL_NORMAL') {
    renderNormalWinners(message.winners);
  }
  if (message.action === 'START_ROLL_DEAN') {
    showRound('DEAN_DRAW', '院长特定纪念品抽奖');
    setDeanRolling(message.college);
  }
  if (message.action === 'REROLL_DEAN') {
    showRound('DEAN_DRAW', '院长特定纪念品抽奖');
    setDeanRolling(message.college);
  }
  if (message.action === 'STOP_ROLL_DEAN') {
    stopDeanRolling(message.college || message.winner.college, message.winner);
  }
}

renderDeanCards();
showRound('NORMAL_A', '常规抽奖 A');
channel.addEventListener('message', (event) => handleMessage(event.data));
