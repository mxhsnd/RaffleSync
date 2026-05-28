const colleges = [
  { name: '安全科学与工程学院（应急管理学院）', shortName: '安全科学与工程学院', classPrefix: '安全24' },
  { name: '工商管理学院', shortName: '工商管理学院', classPrefix: '工商24' },
  { name: '电气与控制工程学院', shortName: '电气与控制工程学院', classPrefix: '电气24' },
  { name: '电子与信息工程学院', shortName: '电子与信息工程学院', classPrefix: '电信24' },
  { name: '软件学院（人工智能学院）', shortName: '软件学院', classPrefix: '软件24' }
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
