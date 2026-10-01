const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const storage = new Map();

global.wx = {
  getStorageSync(key) { return storage.get(key); },
  setStorageSync(key, value) { storage.set(key, value); },
};

const { parseQuestionBankJson, QuestionImportError } = require('../miniprogram/services/question-import.js');
const { api } = require('../miniprogram/services/api.js');

async function main() {
  const template = fs.readFileSync(path.join(projectRoot, 'docs', 'question-bank-template.json'), 'utf8');
  const parsed = parseQuestionBankJson(template, 'CIVIL_REAL');
  assert.equal(parsed.subjectId, 'subject-xingce');
  assert.equal(parsed.questions.length, 3);
  assert.deepEqual(parsed.questions.map((item) => item.type), ['SINGLE', 'MULTIPLE', 'JUDGE']);

  assert.throws(
    () => parseQuestionBankJson(template.replace('"answer": "B"', '"answer": "Z"'), 'CIVIL_REAL'),
    (error) => error instanceof QuestionImportError && /第 1 题/.test(error.message),
  );

  await api.initialize();
  const imported = await api.importQuestionBank(parsed, 'CIVIL_REAL', 'question-bank-template.json');
  assert.equal(imported.questionCount, 3);

  const overview = await api.getImportedQuestionOverview();
  assert.deepEqual(overview.civilReal, { bankCount: 1, questionCount: 3 });
  assert.deepEqual(overview.other, { bankCount: 0, questionCount: 0 });

  const banks = await api.listImportedQuestionBanks('CIVIL_REAL');
  assert.equal(banks.length, 1);
  assert.equal(banks[0].title, parsed.title);

  const session = await api.createSession({
    practiceType: 'ORDER',
    chapterIds: [],
    knowledgePointIds: [],
    difficulty: [],
    count: 3,
    questionBankId: imported.id,
  });
  const first = await api.getPracticeQuestion(session.sessionId);
  assert.equal(first.question.originLabel, '考公真题');
  assert.equal(first.question.bankKind, 'CIVIL_REAL');

  const wrongKey = first.question.options.find((item) => !parsed.questions[0].answerKeys.includes(item.key)).key;
  const answer = await api.submitAnswer(session.sessionId, first.question.id, [wrongKey], 8);
  assert.equal(answer.correct, false);

  await api.toggleFavoriteQuestion(first.question.id);
  const favorites = await api.listFavoriteQuestions();
  assert.equal(favorites[0].originLabel, '考公真题');
  const wrong = await api.listWrongQuestions();
  assert.equal(wrong[0].originLabel, '考公真题');

  const result = await api.getSessionResult(session.sessionId);
  assert.equal(result.title, parsed.title);

  await assert.rejects(
    () => api.importQuestionBank(parsed, 'CIVIL_REAL', 'question-bank-template.json'),
    /已经导入过/,
  );

  console.log('question import: ok (parse, persist, practice, answer, wrong, favorite, history title)');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
