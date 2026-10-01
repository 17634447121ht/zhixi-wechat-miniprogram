import type { Question } from '../types/index';

const judgeOptions = [
  { key: 'T', content: '正确' },
  { key: 'F', content: '错误' },
];

export const EXTRA_STEM_QUESTIONS: Question[] = [
  {
    id: 'q-math-05', subjectId: 'subject-math', chapterId: 'ch-calculus', knowledgePointIds: ['kp-limit'], type: 'SINGLE',
    stem: '当 x→0 时，(1-cos x)/x² 的极限为：',
    options: [{ key: 'A', content: '0' }, { key: 'B', content: '1/2' }, { key: 'C', content: '1' }, { key: 'D', content: '不存在' }],
    difficulty: 2, source: '考研数学原创模拟题', year: 2026, sort: 76,
  },
  {
    id: 'q-math-06', subjectId: 'subject-math', chapterId: 'ch-calculus', knowledgePointIds: ['kp-derivative'], type: 'SINGLE',
    stem: '设 f(x)=xeˣ，则 f′(0) 等于：',
    options: [{ key: 'A', content: '0' }, { key: 'B', content: '1' }, { key: 'C', content: 'e' }, { key: 'D', content: '2' }],
    difficulty: 2, source: '考研数学原创模拟题', year: 2026, sort: 77,
  },
  {
    id: 'q-math-07', subjectId: 'subject-math', chapterId: 'ch-calculus', knowledgePointIds: ['kp-derivative'], type: 'SINGLE',
    stem: '函数 f(x)=x²-4x 的驻点为：',
    options: [{ key: 'A', content: 'x=-2' }, { key: 'B', content: 'x=0' }, { key: 'C', content: 'x=2' }, { key: 'D', content: 'x=4' }],
    difficulty: 1, source: '考研数学原创模拟题', year: 2026, sort: 78,
  },
  {
    id: 'q-math-08', subjectId: 'subject-math', chapterId: 'ch-calculus', knowledgePointIds: ['kp-derivative', 'kp-limit'], type: 'MULTIPLE',
    stem: '设函数 f 在内点 x₀ 处可导，则下列结论必然成立的有：',
    options: [{ key: 'A', content: 'f 在 x₀ 处连续' }, { key: 'B', content: 'lim(x→x₀)f(x)=f(x₀)' }, { key: 'C', content: 'f 在 x₀ 处的左、右导数存在且相等' }, { key: 'D', content: 'f 在 x₀ 处二阶可导' }],
    difficulty: 3, source: '考研数学原创模拟题', year: 2026, sort: 79,
  },
  {
    id: 'q-math-09', subjectId: 'subject-math', chapterId: 'ch-calculus', knowledgePointIds: ['kp-derivative'], type: 'JUDGE',
    stem: '若函数 f 在 x₀ 处可导且 f′(x₀)=0，则 x₀ 一定是 f 的极值点。', options: judgeOptions,
    difficulty: 2, source: '考研数学原创模拟题', year: 2026, sort: 80,
  },
  {
    id: 'q-math-10', subjectId: 'subject-math', chapterId: 'ch-linear', knowledgePointIds: ['kp-matrix'], type: 'SINGLE',
    stem: '矩阵 A=[[1,2],[2,4]] 的秩为：',
    options: [{ key: 'A', content: '0' }, { key: 'B', content: '1' }, { key: 'C', content: '2' }, { key: 'D', content: '3' }],
    difficulty: 1, source: '考研数学原创模拟题', year: 2026, sort: 81,
  },
  {
    id: 'q-math-11', subjectId: 'subject-math', chapterId: 'ch-linear', knowledgePointIds: ['kp-matrix'], type: 'JUDGE',
    stem: '对于同阶方阵 A、B，总有 det(AB)=det(A)det(B)。', options: judgeOptions,
    difficulty: 1, source: '考研数学原创模拟题', year: 2026, sort: 82,
  },
  {
    id: 'q-math-12', subjectId: 'subject-math', chapterId: 'ch-linear', knowledgePointIds: ['kp-matrix'], type: 'SINGLE',
    stem: '二阶对角矩阵 diag(2,3) 的逆矩阵为：',
    options: [{ key: 'A', content: 'diag(2,3)' }, { key: 'B', content: 'diag(3,2)' }, { key: 'C', content: 'diag(1/2,1/3)' }, { key: 'D', content: 'diag(-2,-3)' }],
    difficulty: 1, source: '考研数学原创模拟题', year: 2026, sort: 83,
  },
  {
    id: 'q-math-13', subjectId: 'subject-math', chapterId: 'ch-linear', knowledgePointIds: ['kp-matrix'], type: 'MULTIPLE',
    stem: '对于 n 阶方阵 A，下列与“A 可逆”等价的条件有：',
    options: [{ key: 'A', content: 'det(A)≠0' }, { key: 'B', content: 'rank(A)=n' }, { key: 'C', content: '齐次方程 Ax=0 只有零解' }, { key: 'D', content: 'tr(A)≠0' }],
    difficulty: 3, source: '考研数学原创模拟题', year: 2026, sort: 84,
  },
  {
    id: 'q-math-14', subjectId: 'subject-math', chapterId: 'ch-probability', knowledgePointIds: ['kp-random-variable'], type: 'SINGLE',
    stem: '掷一枚均匀六面骰子一次，点数为偶数的概率为：',
    options: [{ key: 'A', content: '1/6' }, { key: 'B', content: '1/3' }, { key: 'C', content: '1/2' }, { key: 'D', content: '2/3' }],
    difficulty: 1, source: '考研数学原创模拟题', year: 2026, sort: 85,
  },
  {
    id: 'q-math-15', subjectId: 'subject-math', chapterId: 'ch-probability', knowledgePointIds: ['kp-random-variable'], type: 'SINGLE',
    stem: '事件 A、B 相互独立，P(A)=0.4，P(B)=0.5，则 P(AB) 等于：',
    options: [{ key: 'A', content: '0.1' }, { key: 'B', content: '0.2' }, { key: 'C', content: '0.4' }, { key: 'D', content: '0.9' }],
    difficulty: 1, source: '考研数学原创模拟题', year: 2026, sort: 86,
  },
  {
    id: 'q-math-16', subjectId: 'subject-math', chapterId: 'ch-probability', knowledgePointIds: ['kp-random-variable'], type: 'JUDGE',
    stem: '只要随机变量 X、Y 的期望存在，就有 E(X+Y)=E(X)+E(Y)，不要求 X、Y 相互独立。', options: judgeOptions,
    difficulty: 2, source: '考研数学原创模拟题', year: 2026, sort: 87,
  },
  {
    id: 'q-408-10', subjectId: 'subject-408', chapterId: 'ch-ds', knowledgePointIds: ['kp-stack'], type: 'SINGLE',
    stem: '元素 a、b、c 依次入栈后再连续出栈，出栈顺序为：',
    options: [{ key: 'A', content: 'a、b、c' }, { key: 'B', content: 'a、c、b' }, { key: 'C', content: 'c、b、a' }, { key: 'D', content: 'b、a、c' }],
    difficulty: 1, source: '408 原创模拟题', year: 2026, sort: 88,
  },
  {
    id: 'q-408-11', subjectId: 'subject-408', chapterId: 'ch-ds', knowledgePointIds: ['kp-tree'], type: 'JUDGE',
    stem: '在任意一棵非空二叉树中，度为 0 的结点数总比度为 2 的结点数多 1。', options: judgeOptions,
    difficulty: 2, source: '408 原创模拟题', year: 2026, sort: 89,
  },
  {
    id: 'q-408-12', subjectId: 'subject-408', chapterId: 'ch-ds', knowledgePointIds: ['kp-graph'], type: 'MULTIPLE',
    stem: '关于图的遍历与生成树，下列说法正确的有：',
    options: [{ key: 'A', content: '广度优先遍历通常借助队列实现' }, { key: 'B', content: '深度优先遍历可借助栈或递归实现' }, { key: 'C', content: '含 n 个顶点的连通无向图的生成树有 n-1 条边' }, { key: 'D', content: 'Dijkstra 算法可直接处理任意负权边' }],
    difficulty: 3, source: '408 原创模拟题', year: 2026, sort: 90,
  },
  {
    id: 'q-408-13', subjectId: 'subject-408', chapterId: 'ch-ds', knowledgePointIds: ['kp-tree'], type: 'SINGLE',
    stem: '若根结点位于第 1 层，则具有 31 个结点的完全二叉树高度为：',
    options: [{ key: 'A', content: '4' }, { key: 'B', content: '5' }, { key: 'C', content: '6' }, { key: 'D', content: '31' }],
    difficulty: 2, source: '408 原创模拟题', year: 2026, sort: 91,
  },
  {
    id: 'q-408-14', subjectId: 'subject-408', chapterId: 'ch-org', knowledgePointIds: ['kp-cpu'], type: 'SINGLE',
    stem: 'CPU 中用于保存当前正在执行指令的寄存器通常是：',
    options: [{ key: 'A', content: '程序计数器 PC' }, { key: 'B', content: '指令寄存器 IR' }, { key: 'C', content: '地址寄存器 MAR' }, { key: 'D', content: '状态寄存器 PSW' }],
    difficulty: 1, source: '408 原创模拟题', year: 2026, sort: 92,
  },
  {
    id: 'q-408-15', subjectId: 'subject-408', chapterId: 'ch-org', knowledgePointIds: ['kp-memory'], type: 'MULTIPLE',
    stem: '关于 Cache，下列说法正确的有：',
    options: [{ key: 'A', content: '其设计利用时间局部性和空间局部性' }, { key: 'B', content: '通常比主存速度快、容量小' }, { key: 'C', content: '其存在通常对应用程序员透明' }, { key: 'D', content: '使用 Cache 能保证每次访存都命中' }],
    difficulty: 2, source: '408 原创模拟题', year: 2026, sort: 93,
  },
  {
    id: 'q-408-16', subjectId: 'subject-408', chapterId: 'ch-org', knowledgePointIds: ['kp-memory'], type: 'JUDGE',
    stem: '通常作为主存使用的 DRAM 属于易失性存储器，断电后数据会丢失。', options: judgeOptions,
    difficulty: 1, source: '408 原创模拟题', year: 2026, sort: 94,
  },
  {
    id: 'q-408-17', subjectId: 'subject-408', chapterId: 'ch-os', knowledgePointIds: ['kp-process'], type: 'SINGLE',
    stem: '同一进程内的多个线程通常不共享的是：',
    options: [{ key: 'A', content: '进程地址空间' }, { key: 'B', content: '打开的文件' }, { key: 'C', content: '各自的运行栈' }, { key: 'D', content: '进程拥有的代码段' }],
    difficulty: 2, source: '408 原创模拟题', year: 2026, sort: 95,
  },
  {
    id: 'q-408-18', subjectId: 'subject-408', chapterId: 'ch-os', knowledgePointIds: ['kp-process'], type: 'MULTIPLE',
    stem: '关于信号量的 P、V 操作，下列说法正确的有：',
    options: [{ key: 'A', content: 'P 操作可能使进程阻塞' }, { key: 'B', content: 'V 操作可能唤醒等待进程' }, { key: 'C', content: '二元信号量可用于实现互斥' }, { key: 'D', content: 'P、V 操作必然采用忙等方式' }],
    difficulty: 3, source: '408 原创模拟题', year: 2026, sort: 96,
  },
  {
    id: 'q-408-19', subjectId: 'subject-408', chapterId: 'ch-os', knowledgePointIds: ['kp-virtual-memory'], type: 'JUDGE',
    stem: '虚拟存储技术可以使程序的逻辑地址空间大于实际可用的物理内存。', options: judgeOptions,
    difficulty: 1, source: '408 原创模拟题', year: 2026, sort: 97,
  },
  {
    id: 'q-408-20', subjectId: 'subject-408', chapterId: 'ch-network', knowledgePointIds: ['kp-transport'], type: 'SINGLE',
    stem: 'TCP 建立连接通常使用：',
    options: [{ key: 'A', content: '一次握手' }, { key: 'B', content: '两次握手' }, { key: 'C', content: '三次握手' }, { key: 'D', content: '四次握手' }],
    difficulty: 1, source: '408 原创模拟题', year: 2026, sort: 98,
  },
  {
    id: 'q-408-21', subjectId: 'subject-408', chapterId: 'ch-network', knowledgePointIds: ['kp-network-layer'], type: 'SINGLE',
    stem: '一个 IPv4 /24 子网在通常排除网络地址和广播地址后，可分配给主机的地址数为：',
    options: [{ key: 'A', content: '128' }, { key: 'B', content: '254' }, { key: 'C', content: '255' }, { key: 'D', content: '256' }],
    difficulty: 2, source: '408 原创模拟题', year: 2026, sort: 99,
  },
  {
    id: 'q-408-22', subjectId: 'subject-408', chapterId: 'ch-network', knowledgePointIds: ['kp-transport'], type: 'MULTIPLE',
    stem: '与 TCP 相比，UDP 的典型特点包括：',
    options: [{ key: 'A', content: '无连接' }, { key: 'B', content: '保留应用层报文边界' }, { key: 'C', content: '保证数据可靠、有序到达' }, { key: 'D', content: '首部开销较小' }],
    difficulty: 2, source: '408 原创模拟题', year: 2026, sort: 100,
  },
];
