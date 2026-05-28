# RaffleSync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a pure static dual-screen graduation raffle system with 3000 generated test students, cross-page BroadcastChannel sync, non-repeating winners, and dark glassmorphism event visuals.

**Architecture:** The control page owns all raffle state and sends display commands through `BroadcastChannel('raffle-sync')`. The display page never mutates draw state; it only renders incoming round, rolling, and winner messages. Data generation, control logic, display animation, and custom styles live in separate files.

**Tech Stack:** Static HTML, vanilla JavaScript, HTML5 BroadcastChannel, Tailwind CSS CDN, native CSS animations.

---

## File Structure

- Create `data.js`: defines five colleges and generates `studentData` with 3000 deterministic test students.
- Create `admin.html`: control panel shell with Tailwind CDN, shared styles, data source, and `control.js`.
- Create `index.html`: big-screen display shell with Tailwind CDN, shared styles, data source, and `display.js`.
- Create `control.js`: round switching, winner selection, duplicate prevention, dean reroll state restoration, and BroadcastChannel sending.
- Create `display.js`: BroadcastChannel receiving, normal rolling grid, winner card rendering, dean card rendering, and rolling timers.
- Create `styles.css`: dark background, glassmorphism cards, glow text, rolling grid, card pop-in, and smooth transitions.

## Task 1: Create deterministic student data

**Files:**
- Create: `data.js`

- [ ] **Step 1: Create the generated test data file**

Write `data.js` with this complete content:

```javascript
const colleges = [
  { name: '软件（人工智能）学院', shortName: '软件学院', classPrefix: '软件24' },
  { name: '安全科学与工程学院', shortName: '安全学院', classPrefix: '安全24' },
  { name: '计算机科学与技术学院', shortName: '计算机学院', classPrefix: '计科24' },
  { name: '数字媒体与设计学院', shortName: '数媒学院', classPrefix: '数媒24' },
  { name: '电子信息工程学院', shortName: '电信学院', classPrefix: '电信24' }
];

const familyNames = ['赵', '钱', '孙', '李', '周', '吴', '郑', '王', '冯', '陈', '刘', '杨', '黄', '林', '马', '高', '胡', '郭', '何', '罗'];
const givenNames = ['晨曦', '子涵', '浩然', '雨桐', '梓轩', '思源', '嘉怡', '宇航', '欣然', '明哲', '若溪', '景行', '一诺', '星辰', '知远', '语嫣', '博文', '沐阳', '芷晴', '承泽'];

const studentData = colleges.flatMap((college, collegeIndex) => {
  return Array.from({ length: 600 }, (_, index) => {
    const sequence = collegeIndex * 600 + index + 1;
    const classNumber = String(Math.floor(index / 50) + 1).padStart(2, '0');
    const studentNumber = String(index + 1).padStart(4, '0');

    return {
      college: college.name,
      className: `${college.classPrefix}-${classNumber}`,
      name: `${familyNames[(sequence + collegeIndex) % familyNames.length]}${givenNames[(sequence * 3 + collegeIndex) % givenNames.length]}`,
      studentId: `24${String(collegeIndex + 1).padStart(2, '0')}${studentNumber}`,
      isDrawn: false
    };
  });
});
```

- [ ] **Step 2: Verify data can be loaded in a browser console**

Run: open any local HTML file after Task 2 or Task 3 includes `data.js`, then inspect `studentData.length`.
Expected: `3000`.

## Task 2: Create shared visual styles

**Files:**
- Create: `styles.css`

- [ ] **Step 1: Write the custom CSS**

Write `styles.css` with this complete content:

```css
:root {
  color-scheme: dark;
  --cyan: #38bdf8;
  --violet: #a855f7;
  --gold: #fbbf24;
}

* {
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background:
    radial-gradient(circle at top left, rgba(56, 189, 248, 0.28), transparent 32rem),
    radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.28), transparent 34rem),
    linear-gradient(rgba(2, 6, 23, 0.7), rgba(2, 6, 23, 0.88)),
    url('background.png') center / cover fixed,
    #020617;
  color: white;
  overflow-x: hidden;
}

.glass-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.25rem;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(18px);
}

.glow-text {
  text-shadow: 0 0 14px rgba(56, 189, 248, 0.75), 0 0 34px rgba(168, 85, 247, 0.45);
}

.gold-text {
  color: #fde68a;
  text-shadow: 0 0 18px rgba(251, 191, 36, 0.7);
}

.glow-border {
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.35), 0 0 34px rgba(56, 189, 248, 0.22);
}

.admin-button {
  transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
}

.admin-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 36px rgba(56, 189, 248, 0.25);
}

.admin-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  transform: none;
  box-shadow: none;
}

.rolling-name {
  animation: pulseName 520ms ease-in-out infinite alternate;
}

.winner-card {
  animation: popIn 520ms cubic-bezier(0.2, 1.4, 0.3, 1) both;
}

.dean-card-active {
  border-color: rgba(251, 191, 36, 0.8);
  box-shadow: 0 0 42px rgba(251, 191, 36, 0.24), 0 0 70px rgba(168, 85, 247, 0.2);
}

.fade-shift {
  transition: opacity 260ms ease, transform 260ms ease;
}

@keyframes pulseName {
  from {
    opacity: 0.48;
    transform: translateY(2px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(-2px) scale(1.02);
  }
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.86);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

- [ ] **Step 2: Verify CSS file is plain static CSS**

Run: `Get-Content -Path "C:\Users\mayin\Desktop\RaffleSync\styles.css" -TotalCount 10`
Expected: first lines include `:root`, `color-scheme`, and CSS variables.

## Task 3: Build the control page shell

**Files:**
- Create: `admin.html`

- [ ] **Step 1: Write the control HTML**

Write `admin.html` with this complete content:

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RaffleSync 控制台</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="styles.css">
</head>
<body class="min-h-screen p-6">
  <main class="mx-auto max-w-7xl space-y-6">
    <header class="glass-card p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="text-sm uppercase tracking-[0.45em] text-cyan-200/80">RaffleSync Admin</p>
        <h1 class="text-4xl font-black glow-text">毕业晚会抽奖控制台</h1>
        <p id="statusText" class="mt-2 text-white/70">等待操作，已加载 3000 名测试学生。</p>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <button data-round="NORMAL_A" class="round-btn admin-button rounded-xl bg-cyan-500/25 px-5 py-3 font-bold text-cyan-50 border border-cyan-200/30">常规 A</button>
        <button data-round="NORMAL_B" class="round-btn admin-button rounded-xl bg-violet-500/25 px-5 py-3 font-bold text-violet-50 border border-violet-200/30">常规 B</button>
        <button data-round="DEAN_DRAW" class="round-btn admin-button rounded-xl bg-amber-500/25 px-5 py-3 font-bold text-amber-50 border border-amber-200/30">院长抽奖</button>
      </div>
    </header>

    <section id="normalPanel" class="glass-card p-6 space-y-5">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 class="text-2xl font-black glow-text">常规抽奖</h2>
          <p class="text-white/60">适用于 A/B 两轮，从全名单未中奖学生中随机抽取。</p>
        </div>
        <label class="block">
          <span class="text-sm text-white/70">抽取人数</span>
          <input id="normalCount" type="number" min="1" max="200" value="10" class="mt-2 w-44 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xl font-black text-white outline-none focus:border-cyan-300">
        </label>
      </div>
      <div class="flex flex-wrap gap-3">
        <button id="startNormal" class="admin-button rounded-xl bg-cyan-500 px-6 py-3 font-black text-slate-950">开始滚动</button>
        <button id="stopNormal" class="admin-button rounded-xl bg-amber-400 px-6 py-3 font-black text-slate-950">停止并开奖</button>
      </div>
      <div id="normalWinners" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"></div>
    </section>

    <section id="deanPanel" class="glass-card p-6 space-y-5 hidden">
      <div>
        <h2 class="text-2xl font-black gold-text">院长特定纪念品抽奖</h2>
        <p class="text-white/60">每个学院独立抽取 1 人，支持不在场重抽。</p>
      </div>
      <div id="deanControls" class="grid gap-4 lg:grid-cols-5"></div>
    </section>
  </main>

  <script src="data.js"></script>
  <script src="control.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify the static shell opens**

Run: open `admin.html` in a browser.
Expected: the page shows three round buttons, a normal raffle panel, and no console errors about missing HTML elements after Task 5 exists.

## Task 4: Build the display page shell

**Files:**
- Create: `index.html`

- [ ] **Step 1: Write the display HTML**

Write `index.html` with this complete content:

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RaffleSync 大屏展示</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="styles.css">
</head>
<body class="min-h-screen overflow-hidden">
  <main class="relative flex min-h-screen flex-col p-8">
    <header class="glass-card fade-shift p-6 text-center">
      <p class="text-sm uppercase tracking-[0.55em] text-cyan-200/80">Graduation Party Raffle</p>
      <h1 id="roundTitle" class="mt-3 text-6xl font-black glow-text">毕业晚会幸运抽奖</h1>
      <p id="roundSubtitle" class="mt-3 text-xl text-white/70">请在控制台选择抽奖环节</p>
    </header>

    <section id="normalDisplay" class="flex flex-1 flex-col justify-center gap-8 py-8">
      <div id="rollingGrid" class="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6"></div>
      <div id="winnerGrid" class="grid gap-5 md:grid-cols-3 xl:grid-cols-5"></div>
    </section>

    <section id="deanDisplay" class="hidden flex-1 items-center py-8">
      <div id="deanCards" class="grid w-full gap-5 lg:grid-cols-5"></div>
    </section>
  </main>

  <script src="data.js"></script>
  <script src="display.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify the display shell opens**

Run: open `index.html` in a browser.
Expected: the page shows the event title and empty display area, then renders dean cards after Task 6 loads.

## Task 5: Implement control logic and duplicate-safe draws

**Files:**
- Create: `control.js`

- [ ] **Step 1: Write the control JavaScript**

Write `control.js` with this complete content:

```javascript
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
```

- [ ] **Step 2: Verify duplicate prevention manually**

Run: open `admin.html`, open browser console, execute `studentData.filter(s => s.isDrawn).length` before and after a normal draw.
Expected: before first draw `0`; after drawing 10 students, `10`.

## Task 6: Implement display synchronization and animations

**Files:**
- Create: `display.js`

- [ ] **Step 1: Write the display JavaScript**

Write `display.js` with this complete content:

```javascript
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
```

- [ ] **Step 2: Verify BroadcastChannel sync manually**

Run: open `index.html` and `admin.html` in two tabs in the same browser profile. Click `常规 A`, `开始滚动`, then `停止并开奖`.
Expected: the display tab switches to normal draw, names roll, then winner cards appear.

## Task 7: Full manual verification

**Files:**
- Inspect: `index.html`
- Inspect: `admin.html`
- Inspect: `data.js`
- Inspect: `control.js`
- Inspect: `display.js`
- Inspect: `styles.css`

- [ ] **Step 1: Verify all required files exist**

Run: `Get-ChildItem -Path "C:\Users\mayin\Desktop\RaffleSync" -File | Select-Object -ExpandProperty Name`
Expected output includes:

```text
admin.html
data.js
display.js
control.js
index.html
styles.css
开发文档.md
background.png
```

- [ ] **Step 2: Verify normal A/B non-repeat behavior**

Run manually in browser:
1. Open `index.html` and `admin.html`.
2. In admin, draw 10 people in `常规 A`.
3. In browser console on admin page, run `studentData.filter(s => s.isDrawn).length`.
4. Switch to `常规 B`, draw 20 people.
5. Run `studentData.filter(s => s.isDrawn).length` again.

Expected: after step 3 the value is `10`; after step 5 the value is `30`.

- [ ] **Step 3: Verify dean draw and reroll behavior**

Run manually in browser:
1. Switch admin to `院长抽奖`.
2. Click `抽取` for `软件学院`.
3. Save the shown student ID.
4. Click `重抽` for `软件学院`.
5. Check the newly shown student ID.

Expected: the new student ID differs from the previous ID, and the display page updates the same college card.

- [ ] **Step 4: Verify visual requirements**

Run manually in browser:
1. Inspect `index.html` at full screen size.
2. Confirm dark background uses `background.png`.
3. Confirm cards are translucent with blur, white glowing text, and cyan/violet/gold glow accents.
4. Confirm state changes fade, roll, or pop instead of appearing abruptly.

Expected: display matches dark glassmorphism event style described in the development document.
