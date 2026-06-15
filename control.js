const channel = new BroadcastChannel('raffle-sync');
const state = {
  currentRound: 'NORMAL_A',
  normalRolling: false,
  deanWinners: new Map(),
  deanPendingWinners: new Map(),
  interactiveExcludedIds: new Set(),
  normalPendingWinners: [],
  specifiedPeople: [],
  specifiedPeopleLoaded: false,
  specifiedPeopleError: ''
};

const roundLabels = {
  NORMAL_A: '毕业晚会前期预热活动抽奖',
  NORMAL_B: '毕业晚会互动抽奖',
  DEAN_DRAW: '毕业晚会学院特殊礼物抽奖'
};

const statusText = document.querySelector('#statusText');
const normalPanel = document.querySelector('#normalPanel');
const deanPanel = document.querySelector('#deanPanel');
const normalCount = document.querySelector('#normalCount');
const normalWinners = document.querySelector('#normalWinners');
const deanControls = document.querySelector('#deanControls');
const interactiveExcludeOption = document.querySelector('#interactiveExcludeOption');
const interactiveExcludeToggle = document.querySelector('#interactiveExcludeToggle');
const specifiedDeanToggle = document.querySelector('#specifiedDeanToggle');
const specifiedDeanName = document.querySelector('#specifiedDeanName');
const specifiedDeanClass = document.querySelector('#specifiedDeanClass');
const specifiedDeanStatus = document.querySelector('#specifiedDeanStatus');
const specifiedQuickNumber = document.querySelector('#specifiedQuickNumber');
const applySpecifiedQuickPersonButton = document.querySelector('#applySpecifiedQuickPerson');
const specifiedQuickStatus = document.querySelector('#specifiedQuickStatus');
const startNormalButton = document.querySelector('#startNormal');
const stopNormalButton = document.querySelector('#stopNormal');
const controlButtons = Array.from(document.querySelectorAll('button, input'));

function setControlsDisabled(disabled) {
  controlButtons.forEach((control) => {
    control.disabled = disabled;
  });
}

function send(message) {
  channel.postMessage(message);
}

function updateStatus(text) {
  statusText.textContent = text;
}

function updateSpecifiedQuickStatus(text) {
  if (!specifiedQuickStatus) return;
  specifiedQuickStatus.textContent = text;
}

function normalizeSpecifiedPeople(rawData) {
  if (!rawData || typeof rawData !== 'object') {
    throw new Error('specified-people.json 必须是一个 JSON 对象。');
  }
  if (!Array.isArray(rawData.people)) {
    throw new Error('specified-people.json 的 people 必须是数组。');
  }

  return rawData.people.reduce((people, person) => {
    if (!person || typeof person !== 'object') return people;
    const number = Number(person.number);
    const name = String(person.name || '').trim();
    const className = String(person.className || '').trim();
    if (!Number.isFinite(number) || !name || !className) return people;
    people.push({ number, name, className });
    return people;
  }, []);
}

async function loadSpecifiedPeople() {
  try {
    const response = await fetch('specified-people.json');
    if (!response.ok) {
      throw new Error(`无法读取 specified-people.json：HTTP ${response.status}`);
    }

    const rawData = await response.json();
    state.specifiedPeople = normalizeSpecifiedPeople(rawData);
    state.specifiedPeopleLoaded = true;
    state.specifiedPeopleError = '';
    updateSpecifiedQuickStatus(`快捷人员名单已加载：${state.specifiedPeople.length} 人。只用于填充姓名和班级。`);
  } catch (error) {
    console.error(error);
    state.specifiedPeople = [];
    state.specifiedPeopleLoaded = false;
    state.specifiedPeopleError = error.message;
    updateSpecifiedQuickStatus(`快捷人员 JSON 未加载：${error.message}`);
  }
}

function findSpecifiedPersonByNumber(number) {
  return state.specifiedPeople.find((person) => person.number === number) || null;
}

function applySpecifiedQuickPerson() {
  const rawNumber = specifiedQuickNumber.value.trim();
  if (!rawNumber) {
    updateSpecifiedQuickStatus('请输入快捷编号。');
    return;
  }

  const number = Number(rawNumber);
  if (!Number.isFinite(number)) {
    updateSpecifiedQuickStatus('快捷编号必须是数字。');
    return;
  }

  const person = findSpecifiedPersonByNumber(number);
  if (!person) {
    updateSpecifiedQuickStatus(`未找到快捷编号 ${rawNumber}，姓名和班级未改变。`);
    return;
  }

  specifiedDeanName.value = person.name;
  specifiedDeanClass.value = person.className;
  updateSpecifiedDeanStatus();
  updateSpecifiedQuickStatus(`已填入编号 ${person.number}：${person.name} / ${person.className}。请按原流程手动开启指定并开奖。`);
}

function switchRound(round) {
  state.currentRound = round;
  normalPanel.classList.toggle('hidden', round === 'DEAN_DRAW');
  deanPanel.classList.toggle('hidden', round !== 'DEAN_DRAW');
  interactiveExcludeOption.classList.toggle('hidden', round !== 'NORMAL_B');
  updateStatus(`当前环节：${roundLabels[round]}，活动名单 ${studentData.length} 人。`);
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

function nextTempStudentId() {
  const maxTempNumber = studentData.reduce((max, student) => {
    const match = /^TEMP(\d+)$/.exec(student.studentId || '');
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `TEMP${String(maxTempNumber + 1).padStart(4, '0')}`;
}

function updateSpecifiedDeanStatus() {
  if (!specifiedDeanStatus) return;
  if (!specifiedDeanToggle.checked) {
    specifiedDeanStatus.textContent = '未开启指定抽取，学院特殊礼物抽奖将正常随机。';
    return;
  }
  const name = specifiedDeanName.value.trim();
  const className = specifiedDeanClass.value.trim();
  if (!name || !className) {
    specifiedDeanStatus.textContent = '已开启指定抽取，请填写指定姓名和班级。';
    return;
  }
  specifiedDeanStatus.textContent = `已开启：下一次点击任意学院“开始滚动”时，将指定 ${name} / ${className}。`;
}

function clearSpecifiedDeanControls() {
  specifiedDeanToggle.checked = false;
  specifiedDeanName.value = '';
  specifiedDeanClass.value = '';
  updateSpecifiedDeanStatus();
}

function createSpecifiedDeanWinner(college) {
  if (!specifiedDeanToggle.checked) return null;
  const name = specifiedDeanName.value.trim();
  const className = specifiedDeanClass.value.trim();
  if (!name || !className) {
    updateStatus('请填写指定姓名和班级后再开始滚动。');
    updateSpecifiedDeanStatus();
    return null;
  }

  const specifiedWinner = {
    college,
    className,
    name,
    studentId: nextTempStudentId(),
    isDrawn: false
  };
  studentData.push(specifiedWinner);
  clearSpecifiedDeanControls();
  return specifiedWinner;
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

function applyNormalWinners(winners, round) {
  const shouldExcludeInteractive = round === 'NORMAL_B' && interactiveExcludeToggle.checked;
  winners.forEach((winner) => {
    if (round === 'NORMAL_B') {
      if (shouldExcludeInteractive) {
        state.interactiveExcludedIds.add(winner.studentId);
      }
      return;
    }
    winner.isDrawn = true;
  });
  state.normalRolling = false;
  renderNormalWinners(winners);
  const remainingCount = round === 'NORMAL_B' ? availableNormalStudents().length : availableStudents().length;
  const excludeText = shouldExcludeInteractive ? '，本次互动中奖人已排除下一次互动抽奖' : '';
  updateStatus(`${roundLabels[round]} 已开奖 ${winners.length} 人，剩余 ${remainingCount} 人${excludeText}。`);
}

function startNormal() {
  const count = Math.max(1, Number(normalCount.value) || 1);
  const available = availableNormalStudents();
  if (available.length === 0) {
    updateStatus('当前环节已无可抽取学生。');
    return;
  }
  if (state.normalPendingWinners.length) {
    updateStatus('普通抽奖正在滚动，请先开奖。');
    return;
  }

  const round = state.currentRound;
  const drawCount = Math.min(count, available.length);
  state.normalRolling = true;
  state.normalPendingWinners = pickRandom(available, drawCount);
  startNormalButton.disabled = true;
  stopNormalButton.disabled = false;
  updateStatus(`${roundLabels[round]} 正在滚动，目标 ${drawCount} 人，等待手动开奖。`);
  send({ action: 'START_ROLL_NORMAL', count: drawCount, round, roundLabel: roundLabels[round] });
}

function stopNormal() {
  const round = state.currentRound;
  if (!state.normalPendingWinners.length) {
    updateStatus('请先开始滚动后再开奖。');
    return;
  }

  const winners = state.normalPendingWinners;
  state.normalPendingWinners = [];
  applyNormalWinners(winners, round);
  startNormalButton.disabled = false;
  stopNormalButton.disabled = true;
  send({ action: 'STOP_ROLL_NORMAL', winners, round, roundLabel: roundLabels[round] });
}

function startDeanRolling(college) {
  if (state.deanPendingWinners.has(college)) {
    updateStatus(`${college} 正在滚动，请先开奖。`);
    return;
  }

  const specifiedWinner = createSpecifiedDeanWinner(college);
  if (specifiedDeanToggle.checked && !specifiedWinner) {
    return;
  }

  const [winner] = specifiedWinner ? [specifiedWinner] : pickRandom(availableCollegeStudents(college), 1);
  if (!winner) {
    updateStatus(`${college} 已无可抽取学生。`);
    return;
  }

  state.deanPendingWinners.set(college, winner);
  updateDeanControls();
  updateStatus(`${college} 开始滚动，待开奖：${winner.name}`);
  send({ action: 'START_ROLL_DEAN', college });
}

function revealDeanWinner(college) {
  const winner = state.deanPendingWinners.get(college);
  if (!winner) {
    updateStatus(`${college} 尚未开始滚动。`);
    return;
  }

  winner.isDrawn = true;
  state.deanPendingWinners.delete(college);
  state.deanWinners.set(college, winner);
  updateDeanControls();
  updateStatus(`${college} 抽中：${winner.name}`);
  send({ action: 'STOP_ROLL_DEAN', college, winner });
}

function drawDean(college) {
  startDeanRolling(college);
}

function rerollDean(college) {
  const previousWinner = state.deanWinners.get(college);
  if (!previousWinner) {
    updateStatus(`${college} 还没有已开奖中奖人。`);
    return;
  }

  const original = studentData.find((student) => student.studentId === previousWinner.studentId);
  if (original) {
    original.isDrawn = false;
  }

  state.deanWinners.delete(college);
  state.deanPendingWinners.delete(college);
  updateDeanControls();
  updateStatus(`${college} 已重置上一位中奖人，请重新开始滚动。`);
  send({ action: 'REROLL_DEAN', college, previousWinnerId: previousWinner.studentId });
}

function resetDisplay() {
  state.normalPendingWinners = [];
  state.deanPendingWinners.clear();
  studentData.forEach((student) => {
    student.isDrawn = false;
  });
  state.currentRound = 'NORMAL_A';
  state.normalRolling = false;
  state.deanWinners.clear();
  state.interactiveExcludedIds.clear();
  interactiveExcludeToggle.checked = false;
  clearSpecifiedDeanControls();
  normalWinners.innerHTML = '';
  normalCount.value = 10;
  startNormalButton.disabled = false;
  stopNormalButton.disabled = true;
  updateDeanControls();
  normalPanel.classList.remove('hidden');
  deanPanel.classList.add('hidden');
  updateStatus(`已清理缓存，活动名单 ${studentData.length} 人，前端展示已恢复初始状态。`);
  send({ action: 'RESET_DISPLAY' });
}

function updateDeanControls() {
  deanControls.innerHTML = colleges.map((college) => {
    const winner = state.deanWinners.get(college.name);
    const isPending = state.deanPendingWinners.has(college.name);
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
          <button data-draw-college="${college.name}" class="admin-button rounded-xl bg-red-600 px-4 py-2 font-black text-amber-50" ${isPending ? 'disabled' : ''}>开始滚动</button>
          <button data-reveal-college="${college.name}" class="admin-button rounded-xl bg-amber-400 px-4 py-2 font-black text-red-950" ${isPending ? '' : 'disabled'}>开奖</button>
          <button data-reroll-college="${college.name}" class="admin-button rounded-xl bg-white/10 px-4 py-2 font-black text-amber-50 border border-white/20" ${winner ? '' : 'disabled'}>重抽</button>
        </div>
      </article>
    `;
  }).join('');
}

function bindAdminEvents() {
  document.querySelectorAll('.round-btn').forEach((button) => {
    button.addEventListener('click', () => switchRound(button.dataset.round));
  });

  startNormalButton.addEventListener('click', startNormal);
  stopNormalButton.addEventListener('click', stopNormal);
  document.querySelector('#returnHome').addEventListener('click', resetDisplay);
  document.querySelector('#resetDisplay').addEventListener('click', resetDisplay);
  specifiedDeanToggle.addEventListener('change', updateSpecifiedDeanStatus);
  specifiedDeanName.addEventListener('input', updateSpecifiedDeanStatus);
  specifiedDeanClass.addEventListener('input', updateSpecifiedDeanStatus);
  applySpecifiedQuickPersonButton.addEventListener('click', applySpecifiedQuickPerson);
  specifiedQuickNumber.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      applySpecifiedQuickPerson();
    }
  });

  deanControls.addEventListener('click', (event) => {
    const drawCollege = event.target.dataset.drawCollege;
    const revealCollege = event.target.dataset.revealCollege;
    const rerollCollege = event.target.dataset.rerollCollege;
    if (drawCollege) {
      drawDean(drawCollege);
    }
    if (revealCollege) {
      revealDeanWinner(revealCollege);
    }
    if (rerollCollege) {
      rerollDean(rerollCollege);
    }
  });
}

function initializeAdmin() {
  setControlsDisabled(false);
  bindAdminEvents();
  updateDeanControls();
  updateSpecifiedDeanStatus();
  startNormalButton.disabled = false;
  stopNormalButton.disabled = true;
  switchRound('NORMAL_A');
  updateStatus(`活动名单已加载：${window.raffleEventData.eventName}，共 ${studentData.length} 人。`);
}

function handleDataLoadError(error) {
  console.error(error);
  setControlsDisabled(true);
  updateStatus(`活动名单 JSON 加载失败：${error.message}。请检查 event-data.json，并通过本地服务器打开页面。`);
}

setControlsDisabled(true);
loadSpecifiedPeople();
window.raffleDataReady.then(initializeAdmin).catch(handleDataLoadError);
