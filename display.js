const channel = new BroadcastChannel('raffle-sync');
const introScene = document.querySelector('#introScene');
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

function enterRaffleScene() {
  document.body.classList.add('raffle-active');
  introScene.setAttribute('aria-hidden', 'true');
}

function showRound(round, roundLabel) {
  enterRaffleScene();
  roundTitle.textContent = roundLabel || '';
  roundSubtitle.textContent = '辽宁工程技术大学葫芦岛校区2026年毕业晚会';
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

function resetDisplayState() {
  clearNormalRolling();
  displayState.deanTimers.forEach((timer) => window.clearInterval(timer));
  displayState.deanTimers.clear();
  document.body.classList.remove('raffle-active');
  introScene.removeAttribute('aria-hidden');
  roundTitle.textContent = '';
  roundSubtitle.textContent = '';
  rollingGrid.innerHTML = '';
  winnerGrid.innerHTML = '';
  normalDisplay.classList.remove('hidden');
  normalDisplay.classList.add('flex');
  deanDisplay.classList.add('hidden');
  deanDisplay.classList.remove('flex');
  renderDeanCards();
}

function shortCollegeName(collegeName) {
  const college = colleges.find((item) => item.name === collegeName);
  return college ? college.shortName : collegeName.replace(/（.*?）|\(.*?\)/g, '');
}

function normalGridProfile(count) {
  if (count >= 30) {
    return {
      columns: 10,
      gap: '0.38rem',
      widthScale: 0.715,
      cardClass: 'p-1.5 min-h-[4.35rem]',
      nameClass: 'text-base',
      collegeClass: 'text-[0.6rem]',
      metaClass: 'text-[0.56rem]'
    };
  }
  if (count > 10) {
    return {
      columns: 5,
      gap: '0.5rem',
      cardClass: 'p-1.5 min-h-[4.9rem]',
      nameClass: 'text-lg',
      collegeClass: 'text-[0.68rem]',
      metaClass: 'text-[0.6rem]'
    };
  }
  return {
    columns: 5,
    gap: '0.72rem',
    cardClass: 'p-2.5 min-h-[5.8rem]',
    nameClass: 'text-2xl',
    collegeClass: 'text-xs',
    metaClass: 'text-[0.68rem]'
  };
}

function applyNormalGridLayout(grid, count) {
  const profile = normalGridProfile(count);
  const cardWidth = `${(100 / profile.columns) * (profile.widthScale || 0.55)}%`;
  grid.style.gridTemplateColumns = `repeat(${profile.columns}, minmax(0, ${cardWidth}))`;
  grid.style.justifyContent = 'center';
  grid.style.gap = profile.gap;
  return profile;
}

function startNormalRolling(count) {
  clearNormalRolling();
  winnerGrid.innerHTML = '';
  const rollingCount = Math.max(1, count);
  const profile = applyNormalGridLayout(rollingGrid, rollingCount);
  rollingGrid.innerHTML = Array.from({ length: rollingCount }, () => `<div class="glass-card rolling-name display-name ${profile.cardClass} flex items-center justify-center text-center ${profile.nameClass} font-black text-white/90">等待</div>`).join('');
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
  const profile = applyNormalGridLayout(winnerGrid, winners.length);
  winnerGrid.innerHTML = winners.map((winner, index) => `
    <article class="glass-card winner-card glow-border ${profile.cardClass} text-center" style="animation-delay: ${index * 70}ms">
      <p class="${profile.nameClass} font-black glow-text">${winner.name}</p>
      <p class="mt-1 ${profile.collegeClass} text-amber-100/85">${shortCollegeName(winner.college)}</p>
      <p class="mt-1 ${profile.metaClass} text-white/55">${winner.className}</p>
    </article>
  `).join('');
}

function renderDeanCards() {
  deanCards.innerHTML = colleges.map((college) => `
    <article data-college-card="${college.name}" class="dean-card glass-card fade-shift grid min-h-[15rem] grid-rows-[4.5rem_1fr_3rem] p-4 text-center">
      <div class="flex flex-col items-center justify-center">
        <h2 class="flex min-h-10 items-center justify-center text-xl font-black leading-tight glow-text">${college.shortName}</h2>
      </div>
      <div class="flex flex-col items-center justify-center">
        <p data-dean-name="${college.name}" class="text-3xl font-black text-white/60">待揭晓</p>
        <p data-dean-meta="${college.name}" class="mt-2 text-xs text-white/45">等待控制台抽取</p>
      </div>
      <p class="flex items-end justify-center text-xs leading-tight text-white/45">${college.name}</p>
    </article>
  `).join('');
}

function setDeanRolling(college) {
  const card = deanCards.querySelector(`[data-college-card="${college}"]`);
  const name = deanCards.querySelector(`[data-dean-name="${college}"]`);
  const meta = deanCards.querySelector(`[data-dean-meta="${college}"]`);
  if (!card || !name || !meta) return;
  card.classList.remove('dean-card-drawn');
  name.classList.remove('dean-winner-name');
  card.classList.add('dean-card-active');
  meta.textContent = '';
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
  card.classList.add('dean-card-drawn');
  name.style.animation = 'none';
  name.textContent = winner.name;
  meta.textContent = `${winner.className} · ${winner.studentId}`;
  window.requestAnimationFrame(() => {
    name.style.animation = '';
    name.classList.add('gold-text', 'dean-winner-name');
  });
}

function handleMessage(message) {
  if (message.action === 'RESET_DISPLAY') {
    resetDisplayState();
    return;
  }
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
    showRound('DEAN_DRAW', '毕业晚会学院特殊礼物抽奖');
    setDeanRolling(message.college);
  }
  if (message.action === 'REROLL_DEAN') {
    showRound('DEAN_DRAW', '毕业晚会学院特殊礼物抽奖');
    setDeanRolling(message.college);
  }
  if (message.action === 'STOP_ROLL_DEAN') {
    stopDeanRolling(message.college || message.winner.college, message.winner);
  }
}

function bindDisplayEvents() {
  channel.addEventListener('message', (event) => handleMessage(event.data));
}

function showDisplayDataError(error) {
  console.error(error);
  enterRaffleScene();
  roundTitle.textContent = '活动名单加载失败';
  roundSubtitle.textContent = '请检查 event-data.json，并通过本地服务器打开页面。';
  normalDisplay.classList.remove('hidden');
  normalDisplay.classList.add('flex');
  deanDisplay.classList.add('hidden');
  winnerGrid.innerHTML = `
    <article class="glass-card glow-border p-6 text-center">
      <p class="text-2xl font-black text-white">${error.message}</p>
    </article>
  `;
}

function initializeDisplay() {
  bindDisplayEvents();
  renderDeanCards();
}

window.raffleDataReady.then(initializeDisplay).catch(showDisplayDataError);
