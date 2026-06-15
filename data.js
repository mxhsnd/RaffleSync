const EVENT_DATA_URL = 'event-data.json';

window.raffleEventData = null;
window.colleges = [];
window.studentData = [];

function assertArray(value, label) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label} 必须是非空数组。`);
  }
}

function assertText(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} 必须是非空文本。`);
  }
}

function normalizeCollege(college, index) {
  assertText(college.name, `colleges[${index}].name`);
  assertText(college.shortName, `colleges[${index}].shortName`);
  return {
    name: college.name.trim(),
    shortName: college.shortName.trim()
  };
}

function normalizeStudent(student, index, collegeNames, seenIds) {
  assertText(student.college, `students[${index}].college`);
  assertText(student.className, `students[${index}].className`);
  assertText(student.name, `students[${index}].name`);
  assertText(student.studentId, `students[${index}].studentId`);

  const college = student.college.trim();
  const studentId = student.studentId.trim();
  if (!collegeNames.has(college)) {
    throw new Error(`${student.name || `students[${index}]`} 的学院不在 colleges 列表中：${college}`);
  }
  if (seenIds.has(studentId)) {
    throw new Error(`studentId 重复：${studentId}`);
  }
  seenIds.add(studentId);

  return {
    college,
    className: student.className.trim(),
    name: student.name.trim(),
    studentId,
    isDrawn: false
  };
}

function normalizeEventData(rawData) {
  if (!rawData || typeof rawData !== 'object') {
    throw new Error('event-data.json 必须是一个 JSON 对象。');
  }

  assertText(rawData.eventName, 'eventName');
  assertArray(rawData.colleges, 'colleges');
  assertArray(rawData.students, 'students');

  const normalizedColleges = rawData.colleges.map(normalizeCollege);
  const collegeNames = new Set(normalizedColleges.map((college) => college.name));
  const seenIds = new Set();
  const normalizedStudents = rawData.students.map((student, index) => normalizeStudent(student, index, collegeNames, seenIds));

  return {
    eventName: rawData.eventName.trim(),
    colleges: normalizedColleges,
    students: normalizedStudents
  };
}

async function loadRaffleEventData() {
  const response = await fetch('event-data.json');
  if (!response.ok) {
    throw new Error(`无法读取 ${EVENT_DATA_URL}：HTTP ${response.status}`);
  }

  const rawData = await response.json();
  const eventData = normalizeEventData(rawData);
  window.raffleEventData = eventData;
  window.colleges = eventData.colleges;
  window.studentData = eventData.students;
  return eventData;
}

window.raffleDataReady = loadRaffleEventData();
