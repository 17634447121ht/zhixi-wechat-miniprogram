import type { Question, QuestionMaterial } from '../types/index';
import { EXTRA_CIVIL_MATERIALS, EXTRA_CIVIL_QUESTIONS } from './questions-civil-extra';
import { EXTRA_HUMANITIES_MATERIALS, EXTRA_HUMANITIES_QUESTIONS } from './questions-humanities-extra';
import { EXTRA_STEM_QUESTIONS } from './questions-stem-extra';

const judgeOptions = [
  { key: 'T', content: '正确' },
  { key: 'F', content: '错误' },
];

export const MATERIALS: QuestionMaterial[] = [
  {
    id: 'material-economy-2025',
    subjectId: 'subject-xingce',
    title: '某地区数字经济发展情况',
    content: '2024 年某地区数字经济核心产业增加值为 2,640 亿元，比上年增长 10.0%；同期地区生产总值为 12,000 亿元，比上年增长 5.0%。2023 年数字经济核心产业增加值占地区生产总值的比重为 21.0%。',
    source: '原创模拟材料',
    year: 2025,
  },
  {
    id: 'material-reading-habit',
    subjectId: 'subject-english',
    title: 'Reading passage',
    content: 'Good learning is rarely the result of a single burst of effort. It is more often built through short, focused sessions that are repeated over time. When learners review just before forgetting, memory becomes stronger and future review can be delayed.',
    source: '原创英语阅读',
    year: 2026,
  },
  ...EXTRA_CIVIL_MATERIALS,
  ...EXTRA_HUMANITIES_MATERIALS,
];

export const QUESTIONS: Question[] = [
  {
    id: 'q-xc-01', subjectId: 'subject-xingce', chapterId: 'ch-verbal', knowledgePointIds: ['kp-word-choice'], type: 'SINGLE',
    stem: '推进基层治理，既要完善制度，也要在日常服务中体现温度。填入画线处最恰当的一项是：制度与温度应当彼此____。',
    options: [{ key: 'A', content: '割裂' }, { key: 'B', content: '补充' }, { key: 'C', content: '排斥' }, { key: 'D', content: '替代' }],
    difficulty: 1, source: '原创模拟题', year: 2026, sort: 1,
  },
  {
    id: 'q-xc-02', subjectId: 'subject-xingce', chapterId: 'ch-verbal', knowledgePointIds: ['kp-reading-main'], type: 'SINGLE',
    stem: '“阅读不是为了记住所有细节，而是为了建立理解世界的新坐标。”这句话主要强调阅读能够：',
    options: [{ key: 'A', content: '替代现实经验' }, { key: 'B', content: '减少记忆负担' }, { key: 'C', content: '扩展认知框架' }, { key: 'D', content: '提高阅读速度' }],
    difficulty: 2, source: '原创模拟题', year: 2026, sort: 2,
  },
  {
    id: 'q-xc-03', subjectId: 'subject-xingce', chapterId: 'ch-quant', knowledgePointIds: ['kp-work'], type: 'SINGLE',
    stem: '甲单独完成一项工作需要 12 天，乙单独完成需要 18 天。两人合作 4 天后，剩余工作由甲完成，还需要多少天？',
    options: [{ key: 'A', content: '4 天' }, { key: 'B', content: '5 天' }, { key: 'C', content: '5⅓ 天' }, { key: 'D', content: '6 天' }],
    difficulty: 3, source: '原创模拟题', year: 2026, sort: 3,
  },
  {
    id: 'q-xc-04', subjectId: 'subject-xingce', chapterId: 'ch-quant', knowledgePointIds: ['kp-ratio'], type: 'SINGLE',
    stem: '某班男生与女生人数之比为 3∶2，调入 4 名女生后比例变为 3∶2.5。原来全班共有多少人？',
    options: [{ key: 'A', content: '32 人' }, { key: 'B', content: '36 人' }, { key: 'C', content: '40 人' }, { key: 'D', content: '45 人' }],
    difficulty: 3, source: '原创模拟题', year: 2026, sort: 4,
  },
  {
    id: 'q-xc-05', subjectId: 'subject-xingce', chapterId: 'ch-reason', knowledgePointIds: ['kp-logic'], type: 'MULTIPLE',
    stem: '已知“如果今天下雨，那么活动改到室内”为真。下列一定成立的有：',
    options: [{ key: 'A', content: '今天下雨，活动会改到室内' }, { key: 'B', content: '活动未改到室内，今天没有下雨' }, { key: 'C', content: '活动改到室内，今天一定下雨' }, { key: 'D', content: '今天不下雨，活动一定不在室内' }],
    difficulty: 2, source: '原创模拟题', year: 2026, sort: 5,
  },
  {
    id: 'q-xc-06', subjectId: 'subject-xingce', chapterId: 'ch-reason', knowledgePointIds: ['kp-definition'], type: 'SINGLE',
    stem: '“沉没成本”是已经发生且无法收回的成本。下列最符合该定义的是：',
    options: [{ key: 'A', content: '决定是否购买一台新电脑时比较售价' }, { key: 'B', content: '因已买电影票而坚持看完不喜欢的电影' }, { key: 'C', content: '为未来旅行提前制定预算' }, { key: 'D', content: '选择利率更高的储蓄产品' }],
    difficulty: 2, source: '原创模拟题', year: 2026, sort: 6,
  },
  {
    id: 'q-xc-07', subjectId: 'subject-xingce', chapterId: 'ch-common', knowledgePointIds: ['kp-law-common'], type: 'JUDGE',
    stem: '在我国，任何组织或者个人都不得有超越宪法和法律的特权。', options: judgeOptions,
    difficulty: 1, source: '基础常识', year: 2026, sort: 7,
  },
  {
    id: 'q-xc-08', subjectId: 'subject-xingce', chapterId: 'ch-common', knowledgePointIds: ['kp-science-common'], type: 'MULTIPLE',
    stem: '下列属于可再生能源的有：',
    options: [{ key: 'A', content: '太阳能' }, { key: 'B', content: '风能' }, { key: 'C', content: '煤炭' }, { key: 'D', content: '地热能' }],
    difficulty: 1, source: '基础常识', year: 2026, sort: 8,
  },
  {
    id: 'q-xc-09', subjectId: 'subject-xingce', chapterId: 'ch-data', knowledgePointIds: ['kp-growth'], materialId: 'material-economy-2025', type: 'SINGLE',
    stem: '按材料数据估算，2023 年该地区数字经济核心产业增加值约为多少亿元？',
    options: [{ key: 'A', content: '2,200' }, { key: 'B', content: '2,400' }, { key: 'C', content: '2,520' }, { key: 'D', content: '2,904' }],
    difficulty: 2, source: '原创模拟材料', year: 2025, sort: 9,
  },
  {
    id: 'q-xc-10', subjectId: 'subject-xingce', chapterId: 'ch-data', knowledgePointIds: ['kp-share', 'kp-growth'], materialId: 'material-economy-2025', type: 'SINGLE',
    stem: '2024 年数字经济核心产业增加值占地区生产总值的比重为：',
    options: [{ key: 'A', content: '20%' }, { key: 'B', content: '21%' }, { key: 'C', content: '22%' }, { key: 'D', content: '24%' }],
    difficulty: 1, source: '原创模拟材料', year: 2025, sort: 10,
  },

  {
    id: 'q-pol-01', subjectId: 'subject-politics', chapterId: 'ch-marx', knowledgePointIds: ['kp-dialectics'], type: 'SINGLE',
    stem: '唯物辩证法认为，事物发展的根本动力在于：',
    options: [{ key: 'A', content: '事物内部的矛盾运动' }, { key: 'B', content: '外部环境的偶然变化' }, { key: 'C', content: '人的主观愿望' }, { key: 'D', content: '静止不变的条件' }],
    difficulty: 2, source: '政治基础题', year: 2026, sort: 11,
  },
  {
    id: 'q-pol-02', subjectId: 'subject-politics', chapterId: 'ch-mao', knowledgePointIds: ['kp-theory'], type: 'MULTIPLE',
    stem: '推进中国式现代化需要坚持的基本原则包括：',
    options: [{ key: 'A', content: '坚持党的领导' }, { key: 'B', content: '坚持以人民为中心' }, { key: 'C', content: '坚持深化改革开放' }, { key: 'D', content: '照搬别国模式' }],
    difficulty: 2, source: '政治基础题', year: 2026, sort: 12,
  },
  {
    id: 'q-pol-03', subjectId: 'subject-politics', chapterId: 'ch-history', knowledgePointIds: ['kp-revolution'], type: 'JUDGE',
    stem: '五四运动标志着中国新民主主义革命的开端。', options: judgeOptions,
    difficulty: 1, source: '政治基础题', year: 2026, sort: 13,
  },
  {
    id: 'q-pol-04', subjectId: 'subject-politics', chapterId: 'ch-law', knowledgePointIds: ['kp-rule-law'], type: 'SINGLE',
    stem: '法治思维首先要求处理问题时坚持：',
    options: [{ key: 'A', content: '个人好恶优先' }, { key: 'B', content: '权力不受约束' }, { key: 'C', content: '规则和程序意识' }, { key: 'D', content: '结果可以替代程序' }],
    difficulty: 1, source: '政治基础题', year: 2026, sort: 14,
  },

  {
    id: 'q-eng-01', subjectId: 'subject-english', chapterId: 'ch-cloze', knowledgePointIds: ['kp-context'], type: 'SINGLE',
    stem: 'Regular review does not merely preserve memory; it also ____ the learner’s confidence.',
    options: [{ key: 'A', content: 'weakens' }, { key: 'B', content: 'reinforces' }, { key: 'C', content: 'ignores' }, { key: 'D', content: 'interrupts' }],
    difficulty: 2, source: '原创英语题', year: 2026, sort: 15,
  },
  {
    id: 'q-eng-02', subjectId: 'subject-english', chapterId: 'ch-reading', knowledgePointIds: ['kp-detail'], materialId: 'material-reading-habit', type: 'SINGLE',
    stem: 'According to the passage, effective learning is usually built through:',
    options: [{ key: 'A', content: 'one long study session' }, { key: 'B', content: 'repeated focused sessions' }, { key: 'C', content: 'avoiding all mistakes' }, { key: 'D', content: 'memorizing every detail' }],
    difficulty: 1, source: '原创英语阅读', year: 2026, sort: 16,
  },
  {
    id: 'q-eng-03', subjectId: 'subject-english', chapterId: 'ch-reading', knowledgePointIds: ['kp-inference'], materialId: 'material-reading-habit', type: 'SINGLE',
    stem: 'The passage suggests that review should ideally happen:',
    options: [{ key: 'A', content: 'after everything is forgotten' }, { key: 'B', content: 'only before an exam' }, { key: 'C', content: 'shortly before forgetting' }, { key: 'D', content: 'at exactly the same interval forever' }],
    difficulty: 2, source: '原创英语阅读', year: 2026, sort: 17,
  },
  {
    id: 'q-eng-04', subjectId: 'subject-english', chapterId: 'ch-translation', knowledgePointIds: ['kp-long-sentence'], type: 'SINGLE',
    stem: '“What matters is not how much is read, but how deeply it is understood.”最恰当的翻译是：',
    options: [{ key: 'A', content: '重要的不是读了多少，而是理解得有多深。' }, { key: 'B', content: '阅读越多，理解一定越深。' }, { key: 'C', content: '只要理解，就不需要阅读。' }, { key: 'D', content: '重要的是阅读速度，而不是内容。' }],
    difficulty: 1, source: '原创英语题', year: 2026, sort: 18,
  },

  {
    id: 'q-math-01', subjectId: 'subject-math', chapterId: 'ch-calculus', knowledgePointIds: ['kp-limit'], type: 'SINGLE',
    stem: '当 x→0 时，sin x / x 的极限为：',
    options: [{ key: 'A', content: '0' }, { key: 'B', content: '1' }, { key: 'C', content: '∞' }, { key: 'D', content: '不存在' }],
    difficulty: 1, source: '数学基础题', year: 2026, sort: 19,
  },
  {
    id: 'q-math-02', subjectId: 'subject-math', chapterId: 'ch-calculus', knowledgePointIds: ['kp-derivative'], type: 'SINGLE',
    stem: '函数 f(x)=x³ 在 x=2 处的导数值为：',
    options: [{ key: 'A', content: '4' }, { key: 'B', content: '6' }, { key: 'C', content: '8' }, { key: 'D', content: '12' }],
    difficulty: 1, source: '数学基础题', year: 2026, sort: 20,
  },
  {
    id: 'q-math-03', subjectId: 'subject-math', chapterId: 'ch-linear', knowledgePointIds: ['kp-matrix'], type: 'SINGLE',
    stem: '二阶单位矩阵的行列式等于：',
    options: [{ key: 'A', content: '-1' }, { key: 'B', content: '0' }, { key: 'C', content: '1' }, { key: 'D', content: '2' }],
    difficulty: 1, source: '数学基础题', year: 2026, sort: 21,
  },
  {
    id: 'q-math-04', subjectId: 'subject-math', chapterId: 'ch-probability', knowledgePointIds: ['kp-random-variable'], type: 'JUDGE',
    stem: '任意随机变量的方差都不小于 0。', options: judgeOptions,
    difficulty: 1, source: '数学基础题', year: 2026, sort: 22,
  },

  {
    id: 'q-408-01', subjectId: 'subject-408', chapterId: 'ch-ds', knowledgePointIds: ['kp-tree'], type: 'SINGLE',
    stem: '一棵有 n 个结点的完全二叉树，采用顺序存储时，编号为 i 的结点的左孩子编号通常为：',
    options: [{ key: 'A', content: 'i+1' }, { key: 'B', content: '2i' }, { key: 'C', content: '2i+1' }, { key: 'D', content: 'i/2' }],
    difficulty: 2, source: '408 原创模拟题', year: 2026, sort: 23,
  },
  {
    id: 'q-408-02', subjectId: 'subject-408', chapterId: 'ch-ds', knowledgePointIds: ['kp-stack'], type: 'MULTIPLE',
    stem: '下列应用中，适合使用栈结构的有：',
    options: [{ key: 'A', content: '函数调用管理' }, { key: 'B', content: '括号匹配' }, { key: 'C', content: '表达式求值' }, { key: 'D', content: '打印任务的先来先服务调度' }],
    difficulty: 2, source: '408 原创模拟题', year: 2026, sort: 24,
  },
  {
    id: 'q-408-03', subjectId: 'subject-408', chapterId: 'ch-ds', knowledgePointIds: ['kp-graph'], type: 'SINGLE',
    stem: '对无权图求单源最短路径，通常可采用：',
    options: [{ key: 'A', content: '深度优先搜索' }, { key: 'B', content: '广度优先搜索' }, { key: 'C', content: '堆排序' }, { key: 'D', content: '二分查找' }],
    difficulty: 2, source: '408 原创模拟题', year: 2026, sort: 25,
  },
  {
    id: 'q-408-04', subjectId: 'subject-408', chapterId: 'ch-org', knowledgePointIds: ['kp-cpu'], type: 'SINGLE',
    stem: 'CPU 中用于存放当前正在执行指令地址的寄存器是：',
    options: [{ key: 'A', content: 'MAR' }, { key: 'B', content: 'MDR' }, { key: 'C', content: 'PC' }, { key: 'D', content: 'IR' }],
    difficulty: 2, source: '408 原创模拟题', year: 2026, sort: 26,
  },
  {
    id: 'q-408-05', subjectId: 'subject-408', chapterId: 'ch-org', knowledgePointIds: ['kp-memory'], type: 'JUDGE',
    stem: 'Cache 的设置利用了程序访问的局部性原理。', options: judgeOptions,
    difficulty: 1, source: '408 原创模拟题', year: 2026, sort: 27,
  },
  {
    id: 'q-408-06', subjectId: 'subject-408', chapterId: 'ch-os', knowledgePointIds: ['kp-process'], type: 'SINGLE',
    stem: '下列哪项不是产生死锁的必要条件？',
    options: [{ key: 'A', content: '互斥' }, { key: 'B', content: '请求并保持' }, { key: 'C', content: '可剥夺' }, { key: 'D', content: '循环等待' }],
    difficulty: 2, source: '408 原创模拟题', year: 2026, sort: 28,
  },
  {
    id: 'q-408-07', subjectId: 'subject-408', chapterId: 'ch-os', knowledgePointIds: ['kp-virtual-memory'], type: 'MULTIPLE',
    stem: '请求分页系统中，发生缺页中断后可能执行的操作有：',
    options: [{ key: 'A', content: '选择物理块' }, { key: 'B', content: '从外存调入页面' }, { key: 'C', content: '修改页表' }, { key: 'D', content: '立即结束全部进程' }],
    difficulty: 3, source: '408 原创模拟题', year: 2026, sort: 29,
  },
  {
    id: 'q-408-08', subjectId: 'subject-408', chapterId: 'ch-network', knowledgePointIds: ['kp-transport'], type: 'JUDGE',
    stem: 'TCP 是面向连接、可靠的字节流传输协议。', options: judgeOptions,
    difficulty: 1, source: '408 原创模拟题', year: 2026, sort: 30,
  },
  {
    id: 'q-408-09', subjectId: 'subject-408', chapterId: 'ch-network', knowledgePointIds: ['kp-network-layer'], type: 'SINGLE',
    stem: 'IPv4 地址长度为：',
    options: [{ key: 'A', content: '16 位' }, { key: 'B', content: '32 位' }, { key: 'C', content: '64 位' }, { key: 'D', content: '128 位' }],
    difficulty: 1, source: '408 原创模拟题', year: 2026, sort: 31,
  },
  ...EXTRA_CIVIL_QUESTIONS,
  ...EXTRA_HUMANITIES_QUESTIONS,
  ...EXTRA_STEM_QUESTIONS,
];
