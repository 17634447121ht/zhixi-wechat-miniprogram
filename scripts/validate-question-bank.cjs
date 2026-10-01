const assert = require('node:assert/strict');

const { QUESTIONS, MATERIALS } = require('../miniprogram/data/questions.js');
const { ANSWER_KEYS } = require('../miniprogram/data/answer-keys.js');
const { SUBJECTS, CHAPTERS, KNOWLEDGE_POINTS } = require('../miniprogram/data/catalog.js');

function assertUnique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label}存在重复值`);
}

assert.equal(QUESTIONS.length, 100, '题库总数应为 100');
assert.equal(Object.keys(ANSWER_KEYS).length, QUESTIONS.length, '题目和答案数量不一致');
assertUnique(QUESTIONS.map((item) => item.id), '题目 ID');
assertUnique(QUESTIONS.map((item) => item.sort), '题目排序值');
assertUnique(MATERIALS.map((item) => item.id), '材料 ID');

const subjects = new Map(SUBJECTS.map((item) => [item.id, item]));
const chapters = new Map(CHAPTERS.map((item) => [item.id, item]));
const knowledgePoints = new Map(KNOWLEDGE_POINTS.map((item) => [item.id, item]));
const materials = new Map(MATERIALS.map((item) => [item.id, item]));
const questionIds = new Set(QUESTIONS.map((item) => item.id));

for (const answerId of Object.keys(ANSWER_KEYS)) {
  assert.ok(questionIds.has(answerId), `答案引用了不存在的题目：${answerId}`);
}

for (const question of QUESTIONS) {
  const subject = subjects.get(question.subjectId);
  const chapter = chapters.get(question.chapterId);
  const answer = ANSWER_KEYS[question.id];

  assert.ok(subject, `${question.id} 的科目不存在`);
  assert.ok(chapter, `${question.id} 的章节不存在`);
  assert.equal(chapter.subjectId, question.subjectId, `${question.id} 的章节与科目不一致`);
  assert.ok(question.stem.trim().length >= 6, `${question.id} 的题干过短`);
  assert.ok(question.difficulty >= 1 && question.difficulty <= 5, `${question.id} 的难度超出范围`);
  assert.ok(question.source.trim(), `${question.id} 缺少来源`);
  assert.ok(question.knowledgePointIds.length > 0, `${question.id} 缺少知识点`);

  for (const knowledgePointId of question.knowledgePointIds) {
    const knowledgePoint = knowledgePoints.get(knowledgePointId);
    assert.ok(knowledgePoint, `${question.id} 的知识点不存在：${knowledgePointId}`);
    assert.equal(knowledgePoint.chapterId, question.chapterId, `${question.id} 的知识点与章节不一致`);
  }

  assertUnique(question.options.map((item) => item.key), `${question.id} 的选项键`);
  assert.ok(question.options.every((item) => item.key && item.content.trim()), `${question.id} 存在空选项`);
  if (question.type === 'JUDGE') {
    assert.deepEqual(question.options.map((item) => item.key), ['T', 'F'], `${question.id} 的判断题选项错误`);
  } else {
    assert.ok(question.options.length >= 4, `${question.id} 的选择题选项不足`);
  }

  assert.ok(answer, `${question.id} 缺少答案`);
  assert.equal(answer.questionId, question.id, `${question.id} 的答案 ID 不一致`);
  assert.ok(answer.analysis.trim().length >= 10, `${question.id} 的解析过短`);
  assert.ok(answer.correctKeys.length > 0, `${question.id} 没有正确答案`);
  assert.ok(answer.correctKeys.every((key) => question.options.some((option) => option.key === key)), `${question.id} 的答案不在选项中`);
  if (question.type === 'MULTIPLE') assert.ok(answer.correctKeys.length >= 2, `${question.id} 的多选题少于两个正确项`);
  else assert.equal(answer.correctKeys.length, 1, `${question.id} 应只有一个正确项`);

  if (question.materialId) {
    const material = materials.get(question.materialId);
    assert.ok(material, `${question.id} 引用了不存在的材料`);
    assert.equal(material.subjectId, question.subjectId, `${question.id} 的材料与科目不一致`);
  }
}

const subjectCounts = Object.fromEntries(
  SUBJECTS.map((subject) => [subject.name, QUESTIONS.filter((question) => question.subjectId === subject.id).length]),
);
const typeCounts = Object.fromEntries(
  ['SINGLE', 'MULTIPLE', 'JUDGE'].map((type) => [type, QUESTIONS.filter((question) => question.type === type).length]),
);

console.log(`question bank: ok (${QUESTIONS.length} questions, ${MATERIALS.length} materials)`);
console.log('subjects:', subjectCounts);
console.log('types:', typeCounts);
