import type { Question, QuestionMaterial } from '../types/index';

const judgeOptions = [
  { key: 'T', content: '正确' },
  { key: 'F', content: '错误' },
];

export const EXTRA_HUMANITIES_MATERIALS: QuestionMaterial[] = [
  {
    id: 'material-eng-urban-trees',
    subjectId: 'subject-english',
    title: 'Urban trees and city heat',
    content: 'Cities are often warmer than nearby rural areas because roads and buildings absorb and release heat. Planting trees can reduce this effect by providing shade and releasing water through their leaves. Yet the benefits are not immediate: young trees need years to grow and require regular care. Successful projects therefore choose species suited to local conditions and provide enough soil, water and space, rather than simply counting how many saplings are planted.',
    source: '原创英语阅读材料',
    year: 2026,
  },
  {
    id: 'material-eng-effective-notes',
    subjectId: 'subject-english',
    title: 'How notes support learning',
    content: 'When students rewrite ideas in their own words, they must select important information and connect it with what they already know. Recording every word may feel complete, but it can encourage shallow processing. Digital devices are not inherently harmful; what matters is how they are used. Effective notes are usually brief, organized and followed by review, questions and attempts to recall the material without looking.',
    source: '原创英语阅读材料',
    year: 2026,
  },
];

export const EXTRA_HUMANITIES_QUESTIONS: Question[] = [
  {
    id: 'q-pol-05', subjectId: 'subject-politics', chapterId: 'ch-marx', knowledgePointIds: ['kp-dialectics'], type: 'SINGLE',
    stem: '唯物辩证法认为，事物发展的根本原因在于：',
    options: [{ key: 'A', content: '事物所处的地理位置' }, { key: 'B', content: '外部条件的单独作用' }, { key: 'C', content: '事物内部的矛盾性' }, { key: 'D', content: '人的主观愿望' }],
    difficulty: 1, source: '考研政治原创模拟题', year: 2026, sort: 52,
  },
  {
    id: 'q-pol-06', subjectId: 'subject-politics', chapterId: 'ch-marx', knowledgePointIds: ['kp-economy'], type: 'MULTIPLE',
    stem: '关于商品的使用价值和价值，下列说法正确的有：',
    options: [{ key: 'A', content: '商品是使用价值和价值的统一体' }, { key: 'B', content: '具体劳动创造使用价值' }, { key: 'C', content: '抽象劳动形成商品价值' }, { key: 'D', content: '使用价值的大小直接决定价值量' }],
    difficulty: 3, source: '考研政治原创模拟题', year: 2026, sort: 53,
  },
  {
    id: 'q-pol-07', subjectId: 'subject-politics', chapterId: 'ch-marx', knowledgePointIds: ['kp-dialectics'], type: 'JUDGE',
    stem: '矛盾的普遍性寓于特殊性之中，并通过特殊性表现出来。', options: judgeOptions,
    difficulty: 2, source: '考研政治原创模拟题', year: 2026, sort: 54,
  },
  {
    id: 'q-pol-08', subjectId: 'subject-politics', chapterId: 'ch-mao', knowledgePointIds: ['kp-theory'], type: 'SINGLE',
    stem: '认识和把握我国基本国情的重要出发点是，我国仍处于并将长期处于：',
    options: [{ key: 'A', content: '社会主义初级阶段' }, { key: 'B', content: '新民主主义社会' }, { key: 'C', content: '资本主义发展阶段' }, { key: 'D', content: '共产主义高级阶段' }],
    difficulty: 1, source: '考研政治原创模拟题', year: 2026, sort: 55,
  },
  {
    id: 'q-pol-09', subjectId: 'subject-politics', chapterId: 'ch-mao', knowledgePointIds: ['kp-theory'], type: 'MULTIPLE',
    stem: '下列属于新发展理念内容的有：',
    options: [{ key: 'A', content: '创新' }, { key: 'B', content: '协调' }, { key: 'C', content: '绿色' }, { key: 'D', content: '封闭' }],
    difficulty: 1, source: '考研政治原创模拟题', year: 2026, sort: 56,
  },
  {
    id: 'q-pol-10', subjectId: 'subject-politics', chapterId: 'ch-mao', knowledgePointIds: ['kp-theory'], type: 'JUDGE',
    stem: '改革开放是决定当代中国命运的关键一招。', options: judgeOptions,
    difficulty: 1, source: '考研政治原创模拟题', year: 2026, sort: 57,
  },
  {
    id: 'q-pol-11', subjectId: 'subject-politics', chapterId: 'ch-history', knowledgePointIds: ['kp-revolution'], type: 'SINGLE',
    stem: '新文化运动高举的两面主要旗帜是：',
    options: [{ key: 'A', content: '自由与平等' }, { key: 'B', content: '民主与科学' }, { key: 'C', content: '独立与富强' }, { key: 'D', content: '法治与秩序' }],
    difficulty: 1, source: '考研政治原创模拟题', year: 2026, sort: 58,
  },
  {
    id: 'q-pol-12', subjectId: 'subject-politics', chapterId: 'ch-history', knowledgePointIds: ['kp-revolution'], type: 'MULTIPLE',
    stem: '五四运动的重要历史意义包括：',
    options: [{ key: 'A', content: '表现出彻底反帝反封建的革命性' }, { key: 'B', content: '促进中国工人阶级登上政治舞台' }, { key: 'C', content: '促进马克思主义在中国传播' }, { key: 'D', content: '标志中华人民共和国成立' }],
    difficulty: 2, source: '考研政治原创模拟题', year: 2026, sort: 59,
  },
  {
    id: 'q-pol-13', subjectId: 'subject-politics', chapterId: 'ch-history', knowledgePointIds: ['kp-revolution'], type: 'JUDGE',
    stem: '辛亥革命彻底改变了近代中国半殖民地半封建社会的性质。', options: judgeOptions,
    difficulty: 2, source: '考研政治原创模拟题', year: 2026, sort: 60,
  },
  {
    id: 'q-pol-14', subjectId: 'subject-politics', chapterId: 'ch-law', knowledgePointIds: ['kp-rule-law'], type: 'SINGLE',
    stem: '“法定职责必须为，法无授权不可为”主要体现了：',
    options: [{ key: 'A', content: '行政权力应依法行使' }, { key: 'B', content: '个人意愿高于公共规则' }, { key: 'C', content: '所有社会事务都由行政机关处理' }, { key: 'D', content: '程序可以让位于便利' }],
    difficulty: 2, source: '考研政治原创模拟题', year: 2026, sort: 61,
  },
  {
    id: 'q-pol-15', subjectId: 'subject-politics', chapterId: 'ch-law', knowledgePointIds: ['kp-rule-law'], type: 'MULTIPLE',
    stem: '关于法律权利与法律义务的关系，下列认识正确的有：',
    options: [{ key: 'A', content: '二者相互依存、相互联系' }, { key: 'B', content: '权利的行使不能损害他人合法权益' }, { key: 'C', content: '任何权利都不是绝对和无边界的' }, { key: 'D', content: '公民只享有权利而不承担义务' }],
    difficulty: 2, source: '考研政治原创模拟题', year: 2026, sort: 62,
  },
  {
    id: 'q-pol-16', subjectId: 'subject-politics', chapterId: 'ch-law', knowledgePointIds: ['kp-rule-law'], type: 'JUDGE',
    stem: '宪法是国家的根本法，具有最高的法律效力。', options: judgeOptions,
    difficulty: 1, source: '考研政治原创模拟题', year: 2026, sort: 63,
  },
  {
    id: 'q-eng-05', subjectId: 'subject-english', chapterId: 'ch-cloze', knowledgePointIds: ['kp-context'], type: 'SINGLE',
    stem: 'The plan was ambitious; _____, the team completed it on schedule.',
    options: [{ key: 'A', content: 'nevertheless' }, { key: 'B', content: 'therefore' }, { key: 'C', content: 'otherwise' }, { key: 'D', content: 'similarly' }],
    difficulty: 2, source: '考研英语原创模拟题', year: 2026, sort: 64,
  },
  {
    id: 'q-eng-06', subjectId: 'subject-english', chapterId: 'ch-cloze', knowledgePointIds: ['kp-context'], type: 'SINGLE',
    stem: 'Regular review helps learners _____ newly acquired information.',
    options: [{ key: 'A', content: 'consolidate' }, { key: 'B', content: 'interrupt' }, { key: 'C', content: 'withdraw' }, { key: 'D', content: 'scatter' }],
    difficulty: 2, source: '考研英语原创模拟题', year: 2026, sort: 65,
  },
  {
    id: 'q-eng-07', subjectId: 'subject-english', chapterId: 'ch-cloze', knowledgePointIds: ['kp-context'], type: 'SINGLE',
    stem: 'The new procedure not only saves time _____ also reduces errors.',
    options: [{ key: 'A', content: 'and' }, { key: 'B', content: 'or' }, { key: 'C', content: 'but' }, { key: 'D', content: 'so' }],
    difficulty: 1, source: '考研英语原创模拟题', year: 2026, sort: 66,
  },
  {
    id: 'q-eng-08', subjectId: 'subject-english', chapterId: 'ch-cloze', knowledgePointIds: ['kp-context'], type: 'SINGLE',
    stem: 'Instead of treating mistakes as failures, effective learners regard them _____ useful feedback.',
    options: [{ key: 'A', content: 'for' }, { key: 'B', content: 'as' }, { key: 'C', content: 'from' }, { key: 'D', content: 'with' }],
    difficulty: 1, source: '考研英语原创模拟题', year: 2026, sort: 67,
  },
  {
    id: 'q-eng-09', subjectId: 'subject-english', chapterId: 'ch-reading', knowledgePointIds: ['kp-detail'], materialId: 'material-eng-urban-trees', type: 'SINGLE',
    stem: 'According to the passage, trees help cool cities mainly by:',
    options: [{ key: 'A', content: 'reflecting all sunlight' }, { key: 'B', content: 'providing shade and releasing water' }, { key: 'C', content: 'replacing roads and buildings' }, { key: 'D', content: 'increasing wind speed' }],
    difficulty: 1, source: '原创英语阅读材料', year: 2026, sort: 68,
  },
  {
    id: 'q-eng-10', subjectId: 'subject-english', chapterId: 'ch-reading', knowledgePointIds: ['kp-detail'], materialId: 'material-eng-urban-trees', type: 'SINGLE',
    stem: 'The passage states that the benefits of newly planted trees are not immediate because:',
    options: [{ key: 'A', content: 'young trees need time to grow' }, { key: 'B', content: 'cities have no available soil' }, { key: 'C', content: 'all local species grow slowly' }, { key: 'D', content: 'shade makes roads warmer' }],
    difficulty: 1, source: '原创英语阅读材料', year: 2026, sort: 69,
  },
  {
    id: 'q-eng-11', subjectId: 'subject-english', chapterId: 'ch-reading', knowledgePointIds: ['kp-inference'], materialId: 'material-eng-urban-trees', type: 'SINGLE',
    stem: 'It can be inferred that a successful urban tree project should focus on:',
    options: [{ key: 'A', content: 'the number of planting ceremonies' }, { key: 'B', content: 'long-term survival and suitable conditions' }, { key: 'C', content: 'using one species in every city' }, { key: 'D', content: 'planting without later maintenance' }],
    difficulty: 2, source: '原创英语阅读材料', year: 2026, sort: 70,
  },
  {
    id: 'q-eng-12', subjectId: 'subject-english', chapterId: 'ch-reading', knowledgePointIds: ['kp-detail'], materialId: 'material-eng-effective-notes', type: 'SINGLE',
    stem: 'Rewriting ideas in one’s own words requires students to:',
    options: [{ key: 'A', content: 'copy every sentence accurately' }, { key: 'B', content: 'select and connect information' }, { key: 'C', content: 'avoid using prior knowledge' }, { key: 'D', content: 'stop reviewing after class' }],
    difficulty: 1, source: '原创英语阅读材料', year: 2026, sort: 71,
  },
  {
    id: 'q-eng-13', subjectId: 'subject-english', chapterId: 'ch-reading', knowledgePointIds: ['kp-inference'], materialId: 'material-eng-effective-notes', type: 'SINGLE',
    stem: 'What does the author imply about digital devices?',
    options: [{ key: 'A', content: 'They always prevent learning' }, { key: 'B', content: 'Their effect depends on how they are used' }, { key: 'C', content: 'They should replace all handwritten notes' }, { key: 'D', content: 'They make review unnecessary' }],
    difficulty: 2, source: '原创英语阅读材料', year: 2026, sort: 72,
  },
  {
    id: 'q-eng-14', subjectId: 'subject-english', chapterId: 'ch-reading', knowledgePointIds: ['kp-inference'], materialId: 'material-eng-effective-notes', type: 'SINGLE',
    stem: 'Which of the following is the best title for the passage?',
    options: [{ key: 'A', content: 'Why More Words Always Mean Better Notes' }, { key: 'B', content: 'The End of Digital Learning' }, { key: 'C', content: 'Taking Notes for Active Learning' }, { key: 'D', content: 'How to Avoid Every Mistake' }],
    difficulty: 2, source: '原创英语阅读材料', year: 2026, sort: 73,
  },
  {
    id: 'q-eng-15', subjectId: 'subject-english', chapterId: 'ch-translation', knowledgePointIds: ['kp-long-sentence'], type: 'SINGLE',
    stem: '“Policies that appear efficient in the short term may create costs that become visible only later.”最准确的译文是：',
    options: [{ key: 'A', content: '短期看来高效的政策，可能造成日后才显现的成本。' }, { key: 'B', content: '只有长期政策才能降低全部成本。' }, { key: 'C', content: '高效政策产生的成本总能立即看见。' }, { key: 'D', content: '政策是否有效只取决于实施时间。' }],
    difficulty: 2, source: '考研英语原创模拟题', year: 2026, sort: 74,
  },
  {
    id: 'q-eng-16', subjectId: 'subject-english', chapterId: 'ch-translation', knowledgePointIds: ['kp-long-sentence'], type: 'SINGLE',
    stem: '“What matters is not whether a learner makes mistakes, but whether those mistakes are examined and corrected.”最准确的译文是：',
    options: [{ key: 'A', content: '重要的是学习者永远不要犯错。' }, { key: 'B', content: '错误是否被发现比是否被纠正更重要。' }, { key: 'C', content: '重要的不是学习者是否犯错，而是这些错误是否得到审视和纠正。' }, { key: 'D', content: '只要检查错误，学习者就一定不会再犯错。' }],
    difficulty: 2, source: '考研英语原创模拟题', year: 2026, sort: 75,
  },
];
