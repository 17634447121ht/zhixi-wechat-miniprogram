"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionImportError = void 0;
exports.parseQuestionBankJson = parseQuestionBankJson;
const catalog_1 = require("../data/catalog");
class QuestionImportError extends Error {
    constructor(message, questionIndex) {
        super(questionIndex === undefined ? message : `第 ${questionIndex + 1} 题：${message}`);
        this.name = 'QuestionImportError';
        this.questionIndex = questionIndex;
    }
}
exports.QuestionImportError = QuestionImportError;
const CIVIL_SUBJECT_ID = 'subject-xingce';
const MIN_YEAR = 1900;
const MAX_YEAR = 2200;
const SUBJECT_ALIASES = {
    '行测': CIVIL_SUBJECT_ID,
    '公务员行测': CIVIL_SUBJECT_ID,
    '考公行测': CIVIL_SUBJECT_ID,
    '行政职业能力测试': CIVIL_SUBJECT_ID,
    '思想政治理论': 'subject-politics',
    '考研政治': 'subject-politics',
    '考研英语': 'subject-english',
    '英语一': 'subject-english',
    '英语二': 'subject-english',
    '考研数学': 'subject-math',
    '数学一': 'subject-math',
    '数学二': 'subject-math',
    '数学三': 'subject-math',
    '计算机': 'subject-408',
    '计算机统考': 'subject-408',
    '计算机学科专业基础综合': 'subject-408',
    '408': 'subject-408',
};
const CIVIL_CHAPTER_ALIASES = {
    '常识': 'ch-common',
    '常识判断': 'ch-common',
    '言语': 'ch-verbal',
    '言语理解': 'ch-verbal',
    '言语理解与表达': 'ch-verbal',
    '数量': 'ch-quant',
    '数量关系': 'ch-quant',
    '判断': 'ch-reason',
    '判断推理': 'ch-reason',
    '资料': 'ch-data',
    '资料分析': 'ch-data',
};
const KNOWLEDGE_POINT_ALIASES = {
    '法律': 'kp-law-common',
    '法律常识': 'kp-law-common',
    '科技': 'kp-science-common',
    '科技常识': 'kp-science-common',
    '选词': 'kp-word-choice',
    '选词填空': 'kp-word-choice',
    '逻辑填空': 'kp-word-choice',
    '片段': 'kp-reading-main',
    '片段阅读': 'kp-reading-main',
    '主旨概括': 'kp-reading-main',
    '工程': 'kp-work',
    '工程问题': 'kp-work',
    '比例': 'kp-ratio',
    '比例问题': 'kp-ratio',
    '逻辑': 'kp-logic',
    '逻辑判断': 'kp-logic',
    '定义': 'kp-definition',
    '定义判断': 'kp-definition',
    '增长': 'kp-growth',
    '增长率': 'kp-growth',
    '比重': 'kp-share',
};
const TYPE_ALIASES = {
    'SINGLE': 'SINGLE',
    '单选': 'SINGLE',
    '单选题': 'SINGLE',
    'MULTIPLE': 'MULTIPLE',
    '多选': 'MULTIPLE',
    '多选题': 'MULTIPLE',
    'JUDGE': 'JUDGE',
    '判断': 'JUDGE',
    '判断题': 'JUDGE',
};
const TRUE_ANSWERS = new Set(['T', 'TRUE', '正确', '对', '是', '√', '1']);
const FALSE_ANSWERS = new Set(['F', 'FALSE', '错误', '错', '否', '×', 'X', '0']);
function normalizeLookupValue(value) {
    return value
        .normalize('NFKC')
        .trim()
        .toLowerCase()
        .replace(/[\s\-—–_·・,，。.:：/\\()（）\[\]【】《》<>]/g, '');
}
function normalizeOptionKey(value) {
    return String(value === undefined || value === null ? '' : value)
        .normalize('NFKC')
        .trim()
        .toUpperCase();
}
function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function readRequiredString(value, fieldName) {
    if (typeof value !== 'string' || !value.trim()) {
        throw new QuestionImportError(`${fieldName}不能为空`);
    }
    return value.trim();
}
function readOptionalString(value, fallback) {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}
function readYear(value, fieldName) {
    const year = typeof value === 'string' && value.trim() ? Number(value) : value;
    if (typeof year !== 'number' || !Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
        throw new QuestionImportError(`${fieldName}必须是 ${MIN_YEAR}～${MAX_YEAR} 之间的整数`);
    }
    return year;
}
function readDifficulty(value) {
    const labels = {
        '简单': 1,
        '较易': 2,
        '中等': 3,
        '较难': 4,
        '困难': 5,
    };
    const difficulty = typeof value === 'string'
        ? (labels[value.trim()] || Number(value))
        : value;
    if (typeof difficulty !== 'number' || !Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) {
        throw new QuestionImportError('difficulty 必须是 1～5 的整数（也可填写简单、较易、中等、较难、困难）');
    }
    return difficulty;
}
function catalogLookupValues(item) {
    const values = [item.id, item.name];
    if (item.code)
        values.push(item.code);
    values.push(item.id.replace(/^(subject|ch|kp)-/, ''));
    return values.map(normalizeLookupValue);
}
function resolveSubject(value) {
    var _a;
    const label = readRequiredString(value, 'subject');
    const normalized = normalizeLookupValue(label);
    const alias = (_a = Object.entries(SUBJECT_ALIASES)
        .find(([key]) => normalizeLookupValue(key) === normalized)) === null || _a === void 0 ? void 0 : _a[1];
    if (alias)
        return alias;
    const subject = catalog_1.SUBJECTS.find((item) => catalogLookupValues(item).includes(normalized));
    if (!subject) {
        throw new QuestionImportError(`无法识别科目“${label}”，可填写：${catalog_1.SUBJECTS.map((item) => item.name).join('、')}`);
    }
    return subject.id;
}
function resolveChapter(value, subjectId) {
    var _a;
    const label = readRequiredString(value, 'chapter');
    let normalized = normalizeLookupValue(label);
    if (subjectId === CIVIL_SUBJECT_ID) {
        const withoutSubjectPrefix = normalized
            .replace(/^公务员考试/, '')
            .replace(/^考公/, '')
            .replace(/^行测/, '')
            .replace(/^行政职业能力测验/, '')
            .replace(/^行政职业能力测试/, '');
        const alias = (_a = Object.entries(CIVIL_CHAPTER_ALIASES)
            .find(([key]) => normalizeLookupValue(key) === withoutSubjectPrefix)) === null || _a === void 0 ? void 0 : _a[1];
        if (alias)
            return alias;
        normalized = withoutSubjectPrefix || normalized;
    }
    const chapters = catalog_1.CHAPTERS.filter((item) => item.subjectId === subjectId);
    const chapter = chapters.find((item) => catalogLookupValues(item).includes(normalized));
    if (!chapter) {
        throw new QuestionImportError(`无法识别章节“${label}”，当前科目可填写：${chapters.map((item) => item.name).join('、')}`);
    }
    return chapter.id;
}
function resolveKnowledgePoint(value, chapterId) {
    var _a;
    const label = readRequiredString(value, 'knowledgePoints 中的知识点');
    const normalized = normalizeLookupValue(label);
    const points = catalog_1.KNOWLEDGE_POINTS.filter((item) => item.chapterId === chapterId);
    const aliasId = (_a = Object.entries(KNOWLEDGE_POINT_ALIASES)
        .find(([key]) => normalizeLookupValue(key) === normalized)) === null || _a === void 0 ? void 0 : _a[1];
    if (aliasId && points.some((item) => item.id === aliasId))
        return aliasId;
    const point = points.find((item) => catalogLookupValues(item).includes(normalized));
    if (!point) {
        throw new QuestionImportError(`无法识别知识点“${label}”，当前章节可填写：${points.map((item) => item.name).join('、')}`);
    }
    return point.id;
}
function parseKnowledgePoints(value, chapterId) {
    let rawValues;
    if (Array.isArray(value)) {
        rawValues = value;
    }
    else if (typeof value === 'string') {
        rawValues = value.split(/[,，、;；]/).map((item) => item.trim()).filter(Boolean);
    }
    else {
        throw new QuestionImportError('knowledgePoints 必须是数组，也可用逗号分隔的字符串');
    }
    if (!rawValues.length)
        throw new QuestionImportError('knowledgePoints 至少要填写一个知识点');
    return Array.from(new Set(rawValues.map((item) => resolveKnowledgePoint(item, chapterId))));
}
function parseQuestionType(value) {
    const label = readRequiredString(value, 'type');
    const type = TYPE_ALIASES[label.normalize('NFKC').trim().toUpperCase()]
        || TYPE_ALIASES[label.normalize('NFKC').trim()];
    if (!type)
        throw new QuestionImportError('type 仅支持 SINGLE、MULTIPLE、JUDGE');
    return type;
}
function optionKeyAt(index) {
    let number = index + 1;
    let key = '';
    while (number > 0) {
        number -= 1;
        key = String.fromCharCode(65 + (number % 26)) + key;
        number = Math.floor(number / 26);
    }
    return key;
}
function parseOptionObject(value, fallbackKey) {
    if ('key' in value || 'content' in value || 'text' in value || 'label' in value) {
        const key = normalizeOptionKey(value.key === undefined ? fallbackKey : value.key);
        const contentValue = value.content === undefined
            ? (value.text === undefined ? value.label : value.text)
            : value.content;
        return { key, content: readRequiredString(contentValue, `选项 ${key || fallbackKey} 的内容`) };
    }
    const entries = Object.entries(value);
    if (entries.length === 1) {
        const [key, content] = entries[0];
        return { key: normalizeOptionKey(key), content: readRequiredString(content, `选项 ${key} 的内容`) };
    }
    throw new QuestionImportError('options 数组中的对象应使用 {"key":"A","content":"..."} 格式');
}
function parseOptions(value, type) {
    if (type === 'JUDGE' && (value === undefined || value === null)) {
        return [{ key: 'T', content: '正确' }, { key: 'F', content: '错误' }];
    }
    let options;
    if (Array.isArray(value)) {
        options = value.map((item, index) => {
            const fallbackKey = optionKeyAt(index);
            if (typeof item === 'string' || typeof item === 'number') {
                return { key: fallbackKey, content: readRequiredString(String(item), `选项 ${fallbackKey} 的内容`) };
            }
            if (isRecord(item))
                return parseOptionObject(item, fallbackKey);
            throw new QuestionImportError(`options 的第 ${index + 1} 项格式不正确`);
        });
    }
    else if (isRecord(value)) {
        options = Object.entries(value).map(([key, item]) => {
            const content = isRecord(item)
                ? (item.content === undefined ? (item.text === undefined ? item.label : item.text) : item.content)
                : item;
            const normalizedKey = normalizeOptionKey(key);
            return { key: normalizedKey, content: readRequiredString(content, `选项 ${normalizedKey} 的内容`) };
        });
    }
    else {
        throw new QuestionImportError('options 必须是数组或对象');
    }
    if (options.length < 2)
        throw new QuestionImportError('options 至少需要两个选项');
    const keys = options.map((item) => item.key);
    if (keys.some((key) => !key))
        throw new QuestionImportError('选项 key 不能为空');
    if (new Set(keys).size !== keys.length)
        throw new QuestionImportError('选项 key 不能重复');
    return options;
}
function splitAnswerString(value, optionKeys) {
    const answer = value.normalize('NFKC').trim();
    if (!answer)
        return [];
    const exactKey = optionKeys.find((key) => key.toUpperCase() === answer.toUpperCase());
    if (exactKey)
        return [exactKey];
    const separated = answer.split(/[,，、;；|/\s]+/).filter(Boolean);
    if (separated.length > 1)
        return separated;
    if (/^[A-Za-z]+$/.test(answer) && answer.length > 1) {
        const characters = answer.toUpperCase().split('');
        if (characters.every((key) => optionKeys.includes(key)))
            return characters;
    }
    return [answer];
}
function parseRawAnswers(value, optionKeys) {
    const values = Array.isArray(value) ? value : [value];
    const answers = values.reduce((result, item) => {
        if (typeof item !== 'string' && typeof item !== 'number' && typeof item !== 'boolean') {
            throw new QuestionImportError('answer 必须是字符串或字符串数组');
        }
        return result.concat(splitAnswerString(String(item), optionKeys));
    }, []);
    if (!answers.length)
        throw new QuestionImportError('answer 不能为空');
    return answers;
}
function judgeValueFromText(value) {
    const normalized = value.normalize('NFKC').trim().toUpperCase();
    if (TRUE_ANSWERS.has(normalized))
        return 'T';
    if (FALSE_ANSWERS.has(normalized))
        return 'F';
    return undefined;
}
function parseJudgeAnswer(value, rawOptions) {
    const answers = parseRawAnswers(value, rawOptions.map((item) => item.key));
    if (answers.length !== 1)
        throw new QuestionImportError('判断题只能有一个答案');
    const rawAnswer = answers[0];
    const direct = judgeValueFromText(rawAnswer);
    if (direct)
        return [direct];
    const matchedOption = rawOptions.find((item) => item.key === normalizeOptionKey(rawAnswer));
    const fromOption = matchedOption && judgeValueFromText(matchedOption.content);
    if (fromOption)
        return [fromOption];
    if (rawOptions.length === 2) {
        const optionIndex = rawOptions.findIndex((item) => item.key === normalizeOptionKey(rawAnswer));
        if (optionIndex === 0)
            return ['T'];
        if (optionIndex === 1)
            return ['F'];
    }
    throw new QuestionImportError('判断题 answer 请填写 T/F、正确/错误，或对应选项 key');
}
function parseChoiceAnswers(value, options, type) {
    const optionKeys = options.map((item) => item.key);
    const answers = parseRawAnswers(value, optionKeys).map(normalizeOptionKey);
    const uniqueAnswers = Array.from(new Set(answers));
    const missing = uniqueAnswers.filter((key) => !optionKeys.includes(key));
    if (missing.length)
        throw new QuestionImportError(`answer 中的 ${missing.join('、')} 不是有效选项`);
    if (type === 'SINGLE' && uniqueAnswers.length !== 1)
        throw new QuestionImportError('单选题只能有一个答案');
    if (type === 'MULTIPLE' && uniqueAnswers.length < 2)
        throw new QuestionImportError('多选题至少需要两个答案');
    return optionKeys.filter((key) => uniqueAnswers.includes(key));
}
function parseMaterial(value, chapterId, source, year) {
    var _a;
    if (value === undefined || value === null || value === '')
        return undefined;
    const chapterName = ((_a = catalog_1.CHAPTERS.find((item) => item.id === chapterId)) === null || _a === void 0 ? void 0 : _a.name) || '题目';
    if (typeof value === 'string') {
        return {
            title: `${chapterName}材料`,
            content: readRequiredString(value, 'material'),
            source,
            year,
        };
    }
    if (!isRecord(value))
        throw new QuestionImportError('material 必须是字符串或对象');
    return {
        title: readOptionalString(value.title, `${chapterName}材料`),
        content: readRequiredString(value.content, 'material.content'),
        source: readOptionalString(value.source, source),
        year: value.year === undefined ? year : readYear(value.year, 'material.year'),
    };
}
function parseQuestion(value, subjectId, bankSource, bankYear) {
    if (!isRecord(value))
        throw new QuestionImportError('题目必须是对象');
    const chapterId = resolveChapter(value.chapter, subjectId);
    const knowledgePointIds = parseKnowledgePoints(value.knowledgePoints, chapterId);
    const type = parseQuestionType(value.type);
    const stem = readRequiredString(value.stem === undefined ? value.question : value.stem, 'stem');
    const rawOptions = parseOptions(value.options, type);
    const answerKeys = type === 'JUDGE'
        ? parseJudgeAnswer(value.answer, rawOptions)
        : parseChoiceAnswers(value.answer, rawOptions, type);
    const options = type === 'JUDGE'
        ? [{ key: 'T', content: '正确' }, { key: 'F', content: '错误' }]
        : rawOptions;
    const source = readOptionalString(value.source, bankSource);
    const year = value.year === undefined ? bankYear : readYear(value.year, 'year');
    return {
        subjectId,
        chapterId,
        knowledgePointIds,
        type,
        stem,
        options,
        difficulty: readDifficulty(value.difficulty),
        source,
        year,
        answerKeys,
        analysis: readOptionalString(value.analysis, '暂无解析'),
        material: parseMaterial(value.material, chapterId, source, year),
    };
}
/**
 * 解析并校验用户选择的结构化题库 JSON。
 *
 * 本函数不读写微信存储，也不生成题库、题目或材料 ID。调用方应在解析成功后
 * 一次性分配 ID 并保存，避免半份题库写入本地。
 */
function parseQuestionBankJson(content, bankKind) {
    if (bankKind !== 'CIVIL_REAL' && bankKind !== 'OTHER') {
        throw new QuestionImportError('题库类型仅支持 CIVIL_REAL 或 OTHER');
    }
    if (typeof content !== 'string' || !content.trim()) {
        throw new QuestionImportError('题库文件内容为空');
    }
    let raw;
    try {
        raw = JSON.parse(content.replace(/^\uFEFF/, ''));
    }
    catch (error) {
        const detail = error instanceof Error ? error.message : '无法解析';
        throw new QuestionImportError(`JSON 格式错误：${detail}`);
    }
    if (!isRecord(raw))
        throw new QuestionImportError('题库 JSON 根节点必须是对象');
    const title = readRequiredString(raw.title, 'title');
    const source = readRequiredString(raw.source, 'source');
    const year = readYear(raw.year, 'year');
    const subjectId = bankKind === 'CIVIL_REAL' ? CIVIL_SUBJECT_ID : resolveSubject(raw.subject);
    if (!Array.isArray(raw.questions))
        throw new QuestionImportError('questions 必须是数组');
    if (raw.questions.length < 1 || raw.questions.length > 200) {
        throw new QuestionImportError('questions 题目数量必须在 1～200 题之间');
    }
    const questions = raw.questions.map((question, index) => {
        try {
            return parseQuestion(question, subjectId, source, year);
        }
        catch (error) {
            if (error instanceof QuestionImportError && error.questionIndex !== undefined)
                throw error;
            const message = error instanceof Error ? error.message : '格式不正确';
            throw new QuestionImportError(message, index);
        }
    });
    return { title, kind: bankKind, source, year, subjectId, questions };
}
