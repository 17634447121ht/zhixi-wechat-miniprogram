import type { Question, QuestionMaterial } from '../types/index';

const judgeOptions = [
  { key: 'T', content: '正确' },
  { key: 'F', content: '错误' },
];

export const EXTRA_CIVIL_MATERIALS: QuestionMaterial[] = [
  {
    id: 'material-civil-retail-2026',
    subjectId: 'subject-xingce',
    title: '某市社会消费品零售情况',
    content: '2025 年某市社会消费品零售总额为 540 亿元，同比增长 8.0%；其中网上零售额为 162 亿元，同比增长 20.0%。2024 年该市社会消费品零售总额为 500 亿元，网上零售额为 135 亿元。',
    source: '原创资料分析材料',
    year: 2026,
  },
  {
    id: 'material-civil-transport-2026',
    subjectId: 'subject-xingce',
    title: '某地区公共交通客运情况',
    content: '2025 年某地区铁路和公路客运量合计为 240 万人次，同比增长 20.0%。其中铁路客运量为 150 万人次，同比增长 25.0%；公路客运量为 90 万人次。',
    source: '原创资料分析材料',
    year: 2026,
  },
];

export const EXTRA_CIVIL_QUESTIONS: Question[] = [
  {
    id: 'q-xc-11', subjectId: 'subject-xingce', chapterId: 'ch-common', knowledgePointIds: ['kp-law-common'], type: 'SINGLE',
    stem: '依法行政要求行政机关行使职权时首先遵循的是：',
    options: [{ key: 'A', content: '效率优先原则' }, { key: 'B', content: '职权法定原则' }, { key: 'C', content: '结果唯一原则' }, { key: 'D', content: '意思自治原则' }],
    difficulty: 2, source: '行测原创模拟题', year: 2026, sort: 32,
  },
  {
    id: 'q-xc-12', subjectId: 'subject-xingce', chapterId: 'ch-common', knowledgePointIds: ['kp-science-common'], type: 'MULTIPLE',
    stem: '下列现象中，主要涉及水由液态变为气态的有：',
    options: [{ key: 'A', content: '晾晒的衣服逐渐变干' }, { key: 'B', content: '清晨叶片上出现露珠' }, { key: 'C', content: '水烧开后产生水蒸气' }, { key: 'D', content: '冰块在室温下融化' }],
    difficulty: 1, source: '行测原创模拟题', year: 2026, sort: 33,
  },
  {
    id: 'q-xc-13', subjectId: 'subject-xingce', chapterId: 'ch-common', knowledgePointIds: ['kp-law-common'], type: 'JUDGE',
    stem: '我国宪法确认公民在法律面前一律平等。', options: judgeOptions,
    difficulty: 1, source: '行测原创模拟题', year: 2026, sort: 34,
  },
  {
    id: 'q-xc-14', subjectId: 'subject-xingce', chapterId: 'ch-common', knowledgePointIds: ['kp-science-common'], type: 'SINGLE',
    stem: '在其他条件相同的情况下，下列做法最有利于减慢水分蒸发的是：',
    options: [{ key: 'A', content: '升高温度' }, { key: 'B', content: '增大液面面积' }, { key: 'C', content: '加快液面空气流动' }, { key: 'D', content: '降低温度并加盖' }],
    difficulty: 1, source: '行测原创模拟题', year: 2026, sort: 35,
  },
  {
    id: 'q-xc-15', subjectId: 'subject-xingce', chapterId: 'ch-verbal', knowledgePointIds: ['kp-word-choice'], type: 'SINGLE',
    stem: '公共服务不能停留在文件和口号上，还要真正____基层末梢，让群众感受到变化。填入最恰当的一项是：',
    options: [{ key: 'A', content: '回避' }, { key: 'B', content: '阻隔' }, { key: 'C', content: '触达' }, { key: 'D', content: '替换' }],
    difficulty: 1, source: '行测原创模拟题', year: 2026, sort: 36,
  },
  {
    id: 'q-xc-16', subjectId: 'subject-xingce', chapterId: 'ch-verbal', knowledgePointIds: ['kp-word-choice'], type: 'SINGLE',
    stem: '不同来源的史料只有相互____，才能提高研究结论的可信度。填入最恰当的一项是：',
    options: [{ key: 'A', content: '抵消' }, { key: 'B', content: '印证' }, { key: 'C', content: '取代' }, { key: 'D', content: '排斥' }],
    difficulty: 2, source: '行测原创模拟题', year: 2026, sort: 37,
  },
  {
    id: 'q-xc-17', subjectId: 'subject-xingce', chapterId: 'ch-verbal', knowledgePointIds: ['kp-reading-main'], type: 'SINGLE',
    stem: '移动设备让信息获取更加便利，但频繁切换任务会不断打断注意力。真正有效的学习并不取决于同时处理多少信息，而取决于能否在一段时间内持续加工同一问题。这段文字主要强调：',
    options: [{ key: 'A', content: '移动设备不适合用于学习' }, { key: 'B', content: '信息数量决定学习效果' }, { key: 'C', content: '持续专注有助于深度学习' }, { key: 'D', content: '多任务处理能够节约时间' }],
    difficulty: 2, source: '行测原创模拟题', year: 2026, sort: 38,
  },
  {
    id: 'q-xc-18', subjectId: 'subject-xingce', chapterId: 'ch-verbal', knowledgePointIds: ['kp-reading-main'], type: 'SINGLE',
    stem: '城市中的小型图书馆、社区剧场和共享展厅，不一定拥有宏大的建筑，却能以较低门槛把文化活动带到居民身边。由此可以推出：',
    options: [{ key: 'A', content: '公共文化空间越大越好' }, { key: 'B', content: '文化服务的可及性十分重要' }, { key: 'C', content: '社区活动应完全取代大型场馆' }, { key: 'D', content: '建筑规模决定文化影响力' }],
    difficulty: 2, source: '行测原创模拟题', year: 2026, sort: 39,
  },
  {
    id: 'q-xc-19', subjectId: 'subject-xingce', chapterId: 'ch-quant', knowledgePointIds: ['kp-work'], type: 'SINGLE',
    stem: '甲单独完成一项工作需要 10 天，乙单独完成需要 15 天。两人合作 4 天后，剩余工作由甲单独完成，还需要：',
    options: [{ key: 'A', content: '2 天' }, { key: 'B', content: '3 天' }, { key: 'C', content: '3⅓ 天' }, { key: 'D', content: '4 天' }],
    difficulty: 3, source: '行测原创模拟题', year: 2026, sort: 40,
  },
  {
    id: 'q-xc-20', subjectId: 'subject-xingce', chapterId: 'ch-quant', knowledgePointIds: ['kp-work'], type: 'SINGLE',
    stem: '甲管单独注满水池需 6 小时，乙管需 4 小时，排水管单独排空满池需 12 小时。空池同时打开三管，注满需要：',
    options: [{ key: 'A', content: '2 小时' }, { key: 'B', content: '3 小时' }, { key: 'C', content: '4 小时' }, { key: 'D', content: '6 小时' }],
    difficulty: 3, source: '行测原创模拟题', year: 2026, sort: 41,
  },
  {
    id: 'q-xc-21', subjectId: 'subject-xingce', chapterId: 'ch-quant', knowledgePointIds: ['kp-ratio'], type: 'SINGLE',
    stem: '甲、乙两类图书数量之比为 5∶3，共有 64 本。甲类比乙类多多少本？',
    options: [{ key: 'A', content: '8 本' }, { key: 'B', content: '12 本' }, { key: 'C', content: '16 本' }, { key: 'D', content: '24 本' }],
    difficulty: 1, source: '行测原创模拟题', year: 2026, sort: 42,
  },
  {
    id: 'q-xc-22', subjectId: 'subject-xingce', chapterId: 'ch-quant', knowledgePointIds: ['kp-ratio'], type: 'SINGLE',
    stem: '某班男生与女生人数之比为 4∶5。4 名男生离开后，男女人数之比变为 2∶3。该班原有多少人？',
    options: [{ key: 'A', content: '45 人' }, { key: 'B', content: '54 人' }, { key: 'C', content: '63 人' }, { key: 'D', content: '72 人' }],
    difficulty: 3, source: '行测原创模拟题', year: 2026, sort: 43,
  },
  {
    id: 'q-xc-23', subjectId: 'subject-xingce', chapterId: 'ch-reason', knowledgePointIds: ['kp-logic'], type: 'SINGLE',
    stem: '所有研究员都重视证据，有些教师是研究员。由此必然可以推出：',
    options: [{ key: 'A', content: '所有教师都重视证据' }, { key: 'B', content: '有些教师重视证据' }, { key: 'C', content: '重视证据的人都是教师' }, { key: 'D', content: '有些研究员不重视证据' }],
    difficulty: 2, source: '行测原创模拟题', year: 2026, sort: 44,
  },
  {
    id: 'q-xc-24', subjectId: 'subject-xingce', chapterId: 'ch-reason', knowledgePointIds: ['kp-logic'], type: 'MULTIPLE',
    stem: '已知“如果完成培训，那么通过考核；如果通过考核，那么获得证书”。小王完成了培训。必然成立的有：',
    options: [{ key: 'A', content: '小王通过考核' }, { key: 'B', content: '小王获得证书' }, { key: 'C', content: '未完成培训的人都不能获得证书' }, { key: 'D', content: '获得证书的人一定完成了培训' }],
    difficulty: 2, source: '行测原创模拟题', year: 2026, sort: 45,
  },
  {
    id: 'q-xc-25', subjectId: 'subject-xingce', chapterId: 'ch-reason', knowledgePointIds: ['kp-definition'], type: 'SINGLE',
    stem: '机会成本是作出一种选择时所放弃的其他选择中价值最高者。下列体现机会成本的是：',
    options: [{ key: 'A', content: '已购买的电影票无法退还' }, { key: 'B', content: '选择读研而放弃的最高薪工作收入' }, { key: 'C', content: '商品运输途中产生的损耗' }, { key: 'D', content: '企业已经支付的厂房租金' }],
    difficulty: 2, source: '行测原创模拟题', year: 2026, sort: 46,
  },
  {
    id: 'q-xc-26', subjectId: 'subject-xingce', chapterId: 'ch-reason', knowledgePointIds: ['kp-definition'], type: 'SINGLE',
    stem: '反馈控制是根据实际输出与目标之间的偏差调整后续行为。下列最符合该定义的是：',
    options: [{ key: 'A', content: '出发前根据地图规划固定路线' }, { key: 'B', content: '空调检测室温后自动调节制冷功率' }, { key: 'C', content: '商店按照经验一次性确定全年价格' }, { key: 'D', content: '学生随机选择一门课程' }],
    difficulty: 2, source: '行测原创模拟题', year: 2026, sort: 47,
  },
  {
    id: 'q-xc-27', subjectId: 'subject-xingce', chapterId: 'ch-data', knowledgePointIds: ['kp-growth'], materialId: 'material-civil-retail-2026', type: 'SINGLE',
    stem: '根据材料，2025 年该市社会消费品零售总额比 2024 年增加约多少亿元？',
    options: [{ key: 'A', content: '27 亿元' }, { key: 'B', content: '40 亿元' }, { key: 'C', content: '54 亿元' }, { key: 'D', content: '62 亿元' }],
    difficulty: 1, source: '原创资料分析材料', year: 2026, sort: 48,
  },
  {
    id: 'q-xc-28', subjectId: 'subject-xingce', chapterId: 'ch-data', knowledgePointIds: ['kp-share'], materialId: 'material-civil-retail-2026', type: 'SINGLE',
    stem: '根据材料，2025 年网上零售额占社会消费品零售总额的比重为：',
    options: [{ key: 'A', content: '25%' }, { key: 'B', content: '27%' }, { key: 'C', content: '30%' }, { key: 'D', content: '32%' }],
    difficulty: 2, source: '原创资料分析材料', year: 2026, sort: 49,
  },
  {
    id: 'q-xc-29', subjectId: 'subject-xingce', chapterId: 'ch-data', knowledgePointIds: ['kp-growth'], materialId: 'material-civil-transport-2026', type: 'SINGLE',
    stem: '根据材料，2025 年铁路客运量比 2024 年增加约多少万人次？',
    options: [{ key: 'A', content: '20 万人次' }, { key: 'B', content: '25 万人次' }, { key: 'C', content: '30 万人次' }, { key: 'D', content: '37.5 万人次' }],
    difficulty: 2, source: '原创资料分析材料', year: 2026, sort: 50,
  },
  {
    id: 'q-xc-30', subjectId: 'subject-xingce', chapterId: 'ch-data', knowledgePointIds: ['kp-share'], materialId: 'material-civil-transport-2026', type: 'SINGLE',
    stem: '根据材料，2024 年铁路客运量占当年铁路和公路客运量合计的比重为：',
    options: [{ key: 'A', content: '50%' }, { key: 'B', content: '55%' }, { key: 'C', content: '60%' }, { key: 'D', content: '62.5%' }],
    difficulty: 3, source: '原创资料分析材料', year: 2026, sort: 51,
  },
];
