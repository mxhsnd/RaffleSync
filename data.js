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
