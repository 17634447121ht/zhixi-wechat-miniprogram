const assert = require('node:assert/strict');
const zlib = require('node:zlib');

const storage = new Map();
global.wx = {
  getStorageSync(key) { return storage.get(key); },
  setStorageSync(key, value) { storage.set(key, value); },
};

const { parseQuestionBankPdf, extractQuestionPdfText } = require('../miniprogram/services/question-pdf-import.js');
const { api } = require('../miniprogram/services/api.js');

function ascii85Encode(input) {
  let output = '';
  for (let offset = 0; offset < input.length; offset += 4) {
    const chunk = input.subarray(offset, Math.min(input.length, offset + 4));
    const padded = Buffer.alloc(4);
    chunk.copy(padded);
    const value = padded.readUInt32BE(0);
    if (chunk.length === 4 && value === 0) {
      output += 'z';
      continue;
    }
    const encoded = Array(5);
    let remaining = value;
    for (let index = 4; index >= 0; index -= 1) {
      encoded[index] = String.fromCharCode((remaining % 85) + 33);
      remaining = Math.floor(remaining / 85);
    }
    output += encoded.slice(0, chunk.length + 1).join('');
  }
  return Buffer.from(`${output}~>`, 'ascii');
}

function pdfLiteral(value) {
  return `(${value.replace(/([\\()])/g, '\\$1')}) Tj\nT*\n`;
}

function buildTextPdf() {
  const lines = [
    '2025 Civil Service Test',
    '1. Which action is lawful?',
    'A. Hiding the rule',
    'B. Publishing the rule',
    'C. Skipping due process',
    'D. Refusing an explanation',
    'Answer: B',
    'Analysis: Publishing the rule supports lawful administration.',
    '2. Select all prime numbers.',
    'A. 2',
    'B. 3',
    'C. 4',
    'D. 6',
    'Answer: AB',
    'Analysis: Both 2 and 3 are prime.',
  ];
  const content = Buffer.from(`BT\n/F1 12 Tf\n72 760 Td\n${lines.map(pdfLiteral).join('')}ET\n`, 'latin1');
  const encoded = ascii85Encode(zlib.deflateSync(content));
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    Buffer.concat([
      Buffer.from(`<< /Length ${encoded.length} /Filter [/ASCII85Decode /FlateDecode] >>\nstream\n`, 'ascii'),
      encoded,
      Buffer.from('\nendstream', 'ascii'),
    ]),
  ];
  const parts = [Buffer.from('%PDF-1.4\n', 'ascii')];
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.concat(parts).length);
    parts.push(Buffer.from(`${index + 1} 0 obj\n`, 'ascii'));
    parts.push(Buffer.isBuffer(object) ? object : Buffer.from(object, 'ascii'));
    parts.push(Buffer.from('\nendobj\n', 'ascii'));
  });
  const xrefOffset = Buffer.concat(parts).length;
  parts.push(Buffer.from(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`, 'ascii'));
  offsets.slice(1).forEach((offset) => parts.push(Buffer.from(`${String(offset).padStart(10, '0')} 00000 n \n`, 'ascii')));
  parts.push(Buffer.from(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`, 'ascii'));
  return Buffer.concat(parts);
}

function asArrayBuffer(buffer) {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

async function main() {
  const bytes = buildTextPdf();
  const data = asArrayBuffer(bytes);
  const extracted = extractQuestionPdfText(data);
  assert.match(extracted.text, /Which action is lawful/);
  assert.match(extracted.text, /Answer: AB/);

  const parsed = parseQuestionBankPdf(data, 'CIVIL_REAL', '2025 Civil Service Test.pdf');
  assert.equal(parsed.bank.title, '2025 Civil Service Test');
  assert.equal(parsed.bank.year, 2025);
  assert.equal(parsed.bank.subjectId, 'subject-xingce');
  assert.equal(parsed.bank.questions.length, 2);
  assert.deepEqual(parsed.bank.questions.map((item) => item.type), ['SINGLE', 'MULTIPLE']);
  assert.deepEqual(parsed.bank.questions.map((item) => item.answerKeys), [['B'], ['A', 'B']]);
  assert.equal(parsed.skippedQuestionCount, 0);

  assert.throws(
    () => parseQuestionBankPdf(data, 'OTHER', 'test.pdf'),
    /选择题目科目/,
  );
  assert.throws(
    () => parseQuestionBankPdf(asArrayBuffer(Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF')), 'CIVIL_REAL', 'scan.pdf'),
    /可搜索文字/,
  );

  await api.initialize();
  const imported = await api.importQuestionBank(parsed.bank, 'CIVIL_REAL', '2025 Civil Service Test.pdf');
  assert.equal(imported.questionCount, 2);
  const session = await api.createSession({
    practiceType: 'ORDER',
    chapterIds: [],
    knowledgePointIds: [],
    difficulty: [],
    count: 2,
    questionBankId: imported.id,
  });
  const first = await api.getPracticeQuestion(session.sessionId);
  assert.equal(first.question.originLabel, '考公真题');
  assert.match(first.question.stem, /lawful/);

  console.log('question PDF: ok (extract, parse, classify, persist, practice)');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
