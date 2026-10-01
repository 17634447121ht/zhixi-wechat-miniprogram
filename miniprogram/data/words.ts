import type { WordBook, WordItem } from '../types/index';

export const WORDS: WordItem[] = [
  { id: 'w-abandon', spelling: 'abandon', ukPhonetic: '/əˈbændən/', usPhonetic: '/əˈbændən/', partOfSpeech: 'v.', meaning: '放弃；抛弃', example: 'He abandoned the original plan after careful review.', exampleTranslation: '经过认真评估，他放弃了原来的计划。', difficulty: 1 },
  { id: 'w-acquire', spelling: 'acquire', ukPhonetic: '/əˈkwaɪə(r)/', usPhonetic: '/əˈkwaɪər/', partOfSpeech: 'v.', meaning: '获得；习得', example: 'Language skills are acquired through regular practice.', exampleTranslation: '语言能力通过持续练习习得。', difficulty: 2 },
  { id: 'w-allocate', spelling: 'allocate', ukPhonetic: '/ˈæləkeɪt/', usPhonetic: '/ˈæləkeɪt/', partOfSpeech: 'v.', meaning: '分配；拨出', example: 'Allocate more time to your weakest subject.', exampleTranslation: '给最薄弱的科目分配更多时间。', difficulty: 2 },
  { id: 'w-coherent', spelling: 'coherent', ukPhonetic: '/kəʊˈhɪərənt/', usPhonetic: '/koʊˈhɪrənt/', partOfSpeech: 'adj.', meaning: '连贯的；条理清楚的', example: 'A coherent answer is easier to evaluate.', exampleTranslation: '条理清楚的回答更容易评估。', difficulty: 3 },
  { id: 'w-derive', spelling: 'derive', ukPhonetic: '/dɪˈraɪv/', usPhonetic: '/dɪˈraɪv/', partOfSpeech: 'v.', meaning: '获得；源自；推导', example: 'The formula can be derived from two basic rules.', exampleTranslation: '这个公式可以由两条基本规则推导出来。', difficulty: 3 },
  { id: 'w-empirical', spelling: 'empirical', ukPhonetic: '/ɪmˈpɪrɪkl/', usPhonetic: '/ɪmˈpɪrɪkl/', partOfSpeech: 'adj.', meaning: '经验主义的；以观察为依据的', example: 'The claim requires empirical evidence.', exampleTranslation: '这一主张需要实证证据。', difficulty: 4 },
  { id: 'w-facilitate', spelling: 'facilitate', ukPhonetic: '/fəˈsɪlɪteɪt/', usPhonetic: '/fəˈsɪlɪteɪt/', partOfSpeech: 'v.', meaning: '促进；使便利', example: 'Clear feedback facilitates improvement.', exampleTranslation: '清晰的反馈有助于改进。', difficulty: 3 },
  { id: 'w-hypothesis', spelling: 'hypothesis', ukPhonetic: '/haɪˈpɒθəsɪs/', usPhonetic: '/haɪˈpɑːθəsɪs/', partOfSpeech: 'n.', meaning: '假说；假设', example: 'The experiment was designed to test the hypothesis.', exampleTranslation: '该实验旨在检验这一假说。', difficulty: 3 },
  { id: 'w-inevitable', spelling: 'inevitable', ukPhonetic: '/ɪnˈevɪtəbl/', usPhonetic: '/ɪnˈevɪtəbl/', partOfSpeech: 'adj.', meaning: '不可避免的', example: 'Small mistakes are inevitable during learning.', exampleTranslation: '学习过程中出现小错误是不可避免的。', difficulty: 2 },
  { id: 'w-justify', spelling: 'justify', ukPhonetic: '/ˈdʒʌstɪfaɪ/', usPhonetic: '/ˈdʒʌstɪfaɪ/', partOfSpeech: 'v.', meaning: '证明……正当；为……辩护', example: 'You should justify your choice with evidence.', exampleTranslation: '你应该用证据说明选择的理由。', difficulty: 2 },
  { id: 'w-maintain', spelling: 'maintain', ukPhonetic: '/meɪnˈteɪn/', usPhonetic: '/meɪnˈteɪn/', partOfSpeech: 'v.', meaning: '保持；维护；主张', example: 'It is easier to maintain a small daily habit.', exampleTranslation: '保持一个小的每日习惯更容易。', difficulty: 2 },
  { id: 'w-perceive', spelling: 'perceive', ukPhonetic: '/pəˈsiːv/', usPhonetic: '/pərˈsiːv/', partOfSpeech: 'v.', meaning: '察觉；理解；认为', example: 'People perceive the same risk differently.', exampleTranslation: '人们对同一种风险的感知不同。', difficulty: 3 },
  { id: 'w-reinforce', spelling: 'reinforce', ukPhonetic: '/ˌriːɪnˈfɔːs/', usPhonetic: '/ˌriːɪnˈfɔːrs/', partOfSpeech: 'v.', meaning: '加强；巩固', example: 'Spaced review reinforces long-term memory.', exampleTranslation: '间隔复习能巩固长期记忆。', difficulty: 3 },
  { id: 'w-significant', spelling: 'significant', ukPhonetic: '/sɪɡˈnɪfɪkənt/', usPhonetic: '/sɪɡˈnɪfɪkənt/', partOfSpeech: 'adj.', meaning: '重要的；显著的', example: 'The new method produced a significant improvement.', exampleTranslation: '新方法带来了显著提升。', difficulty: 2 },
  { id: 'w-transform', spelling: 'transform', ukPhonetic: '/trænsˈfɔːm/', usPhonetic: '/trænsˈfɔːrm/', partOfSpeech: 'v.', meaning: '改变；转化', example: 'Consistent effort can transform your results.', exampleTranslation: '持续努力可以改变你的结果。', difficulty: 2 },
];

export const WORD_BOOKS: WordBook[] = [
  {
    id: 'book-cet4', code: 'CET4', name: 'CET-4 核心词汇', description: '大学英语四级常用核心词', accent: 'green',
    wordIds: ['w-abandon', 'w-acquire', 'w-allocate', 'w-inevitable', 'w-justify', 'w-maintain', 'w-significant', 'w-transform'],
  },
  {
    id: 'book-cet6', code: 'CET6', name: 'CET-6 进阶词汇', description: '六级阅读与写作高频词', accent: 'orange',
    wordIds: ['w-acquire', 'w-coherent', 'w-derive', 'w-facilitate', 'w-hypothesis', 'w-perceive', 'w-reinforce', 'w-significant'],
  },
  {
    id: 'book-postgrad', code: 'KY_ENGLISH', name: '考研英语核心词汇', description: '覆盖阅读、完形和翻译常见词', accent: 'blue',
    wordIds: WORDS.map((item) => item.id),
  },
];
