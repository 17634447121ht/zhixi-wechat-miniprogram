"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANSWER_KEYS = void 0;
const answer_keys_civil_extra_1 = require("./answer-keys-civil-extra");
const answer_keys_humanities_extra_1 = require("./answer-keys-humanities-extra");
const answer_keys_stem_extra_1 = require("./answer-keys-stem-extra");
exports.ANSWER_KEYS = {
    'q-xc-01': { questionId: 'q-xc-01', correctKeys: ['B'], analysis: '制度提供稳定边界，服务温度弥补制度运行中的机械感，二者关系最适合用“补充”。' },
    'q-xc-02': { questionId: 'q-xc-02', correctKeys: ['C'], analysis: '“建立理解世界的新坐标”指向认知结构和观察视角的扩展，而不是速度或记忆数量。' },
    'q-xc-03': { questionId: 'q-xc-03', correctKeys: ['C'], analysis: '合作效率为 1/12+1/18=5/36，4 天完成 5/9，剩余 4/9；甲独做需要 12×4/9=16/3 天。' },
    'q-xc-04': { questionId: 'q-xc-04', correctKeys: ['C'], analysis: '设原来男女分别为 3x、2x，加入 4 人后 3x:(2x+4)=3:2.5，解得 x=8，总人数为 5x=40。' },
    'q-xc-05': { questionId: 'q-xc-05', correctKeys: ['A', 'B'], analysis: '原命题 P→Q 为真，可直接得到 P 时 Q 成立，也可由逆否命题 ¬Q→¬P 得到 B；肯后和否前均不能必然推出。' },
    'q-xc-06': { questionId: 'q-xc-06', correctKeys: ['B'], analysis: '电影票价已经支付且无法收回，因为已付费而继续投入时间，正是被沉没成本影响的表现。' },
    'q-xc-07': { questionId: 'q-xc-07', correctKeys: ['T'], analysis: '宪法规定一切组织和个人都必须以宪法和法律为根本活动准则，不得有超越它们的特权。' },
    'q-xc-08': { questionId: 'q-xc-08', correctKeys: ['A', 'B', 'D'], analysis: '太阳能、风能和地热能可在较短时间尺度内补充；煤炭属于不可再生化石能源。' },
    'q-xc-09': { questionId: 'q-xc-09', correctKeys: ['B'], analysis: '2023 年增加值≈2640÷(1+10%)=2400 亿元。' },
    'q-xc-10': { questionId: 'q-xc-10', correctKeys: ['C'], analysis: '2640÷12000=22%。也可由比重变化判断：部分增长快于整体，比重较上年上升。' },
    'q-pol-01': { questionId: 'q-pol-01', correctKeys: ['A'], analysis: '唯物辩证法认为矛盾是事物发展的根本动力，内因是变化的根据。' },
    'q-pol-02': { questionId: 'q-pol-02', correctKeys: ['A', 'B', 'C'], analysis: '中国式现代化坚持党的领导、以人民为中心、深化改革开放等原则，不能照搬别国模式。' },
    'q-pol-03': { questionId: 'q-pol-03', correctKeys: ['T'], analysis: '五四运动促进马克思主义传播和工人阶级登上政治舞台，是新民主主义革命的开端。' },
    'q-pol-04': { questionId: 'q-pol-04', correctKeys: ['C'], analysis: '法治思维强调依法办事、权力约束、权利保障以及规则和程序意识。' },
    'q-eng-01': { questionId: 'q-eng-01', correctKeys: ['B'], analysis: 'reinforce 意为“增强、巩固”，与 confidence 搭配且符合上下文。' },
    'q-eng-02': { questionId: 'q-eng-02', correctKeys: ['B'], analysis: '首句之后明确指出 good learning is built through short, focused sessions repeated over time。' },
    'q-eng-03': { questionId: 'q-eng-03', correctKeys: ['C'], analysis: '原文 when learners review just before forgetting 直接对应 shortly before forgetting。' },
    'q-eng-04': { questionId: 'q-eng-04', correctKeys: ['A'], analysis: 'not...but... 表示“不是……而是……”，how deeply it is understood 表示“理解得有多深”。' },
    'q-math-01': { questionId: 'q-math-01', correctKeys: ['B'], analysis: 'sin x / x 在 x→0 时的极限是重要极限 1。' },
    'q-math-02': { questionId: 'q-math-02', correctKeys: ['D'], analysis: 'f′(x)=3x²，代入 x=2 得 12。' },
    'q-math-03': { questionId: 'q-math-03', correctKeys: ['C'], analysis: '单位矩阵主对角线元素均为 1，行列式为主对角线元素乘积，即 1。' },
    'q-math-04': { questionId: 'q-math-04', correctKeys: ['T'], analysis: '方差是随机变量与均值之差平方的期望，因此必定大于或等于 0。' },
    'q-408-01': { questionId: 'q-408-01', correctKeys: ['B'], analysis: '按结点从 1 开始编号的顺序存储约定，结点 i 的左孩子为 2i，右孩子为 2i+1。' },
    'q-408-02': { questionId: 'q-408-02', correctKeys: ['A', 'B', 'C'], analysis: '调用管理、括号匹配和表达式求值都需要后进先出；打印任务的先来先服务更适合队列。' },
    'q-408-03': { questionId: 'q-408-03', correctKeys: ['B'], analysis: '无权图中，广度优先搜索按路径长度逐层扩展，可得到从起点到其他结点的最短路径。' },
    'q-408-04': { questionId: 'q-408-04', correctKeys: ['C'], analysis: '程序计数器 PC 存放下一条（或当前体系结构约定下待执行）指令的地址。' },
    'q-408-05': { questionId: 'q-408-05', correctKeys: ['T'], analysis: 'Cache 利用时间局部性和空间局部性，把近期或邻近数据放在更快的存储层。' },
    'q-408-06': { questionId: 'q-408-06', correctKeys: ['C'], analysis: '死锁四个必要条件是互斥、请求并保持、不可剥夺、循环等待；“可剥夺”不是必要条件。' },
    'q-408-07': { questionId: 'q-408-07', correctKeys: ['A', 'B', 'C'], analysis: '缺页处理会分配或置换物理块、从外存读入页面并更新页表，不会因此结束全部进程。' },
    'q-408-08': { questionId: 'q-408-08', correctKeys: ['T'], analysis: 'TCP 建立连接，提供确认、重传、排序和流量控制，对应用表现为可靠字节流。' },
    'q-408-09': { questionId: 'q-408-09', correctKeys: ['B'], analysis: 'IPv4 地址由 32 位二进制数组成，通常写成四段十进制；IPv6 为 128 位。' },
    ...answer_keys_civil_extra_1.EXTRA_CIVIL_ANSWER_KEYS,
    ...answer_keys_humanities_extra_1.EXTRA_HUMANITIES_ANSWER_KEYS,
    ...answer_keys_stem_extra_1.EXTRA_STEM_ANSWER_KEYS,
};
