"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const index_1 = require("../config/index");
const answer_keys_1 = require("../data/answer-keys");
const catalog_1 = require("../data/catalog");
const questions_1 = require("../data/questions");
const words_1 = require("../data/words");
const question_banks_1 = require("../storage/question-banks");
const state_1 = require("../storage/state");
const answer_1 = require("../utils/answer");
const date_1 = require("../utils/date");
const format_1 = require("../utils/format");
const wordTestCache = {};
function sleep(ms = index_1.MOCK_DELAY_MS) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function response(factory, delay = index_1.MOCK_DELAY_MS) {
    if (delay)
        await sleep(delay);
    return factory();
}
function fail(message) {
    throw new Error(message);
}
function getExam(examId) {
    return catalog_1.EXAMS.find((item) => item.id === examId);
}
function getSubject(subjectId) {
    return catalog_1.SUBJECTS.find((item) => item.id === subjectId);
}
function getChapter(chapterId) {
    return catalog_1.CHAPTERS.find((item) => item.id === chapterId);
}
function getKnowledgePoint(knowledgePointId) {
    return catalog_1.KNOWLEDGE_POINTS.find((item) => item.id === knowledgePointId);
}
function importedBanks() {
    return (0, question_banks_1.loadImportedQuestionBanks)();
}
function getImportedBank(bankId) {
    if (!bankId)
        return undefined;
    return importedBanks().find((item) => item.id === bankId);
}
function allQuestions() {
    return [...questions_1.QUESTIONS, ...importedBanks().reduce((items, bank) => items.concat(bank.questions), [])];
}
function getQuestion(questionId) {
    if (!questionId)
        return undefined;
    return questions_1.QUESTIONS.find((item) => item.id === questionId)
        || importedBanks().reduce((items, bank) => items.concat(bank.questions), []).find((item) => item.id === questionId);
}
function getMaterial(materialId) {
    if (!materialId)
        return undefined;
    return questions_1.MATERIALS.find((item) => item.id === materialId)
        || importedBanks().reduce((items, bank) => items.concat(bank.materials), []).find((item) => item.id === materialId);
}
function getAnswerKey(questionId) {
    return answer_keys_1.ANSWER_KEYS[questionId]
        || importedBanks().reduce((items, bank) => items.concat(bank.answerKeys), []).find((item) => item.questionId === questionId);
}
function getWord(wordId) {
    return words_1.WORDS.find((item) => item.id === wordId);
}
function getBook(bookId) {
    return words_1.WORD_BOOKS.find((item) => item.id === bookId);
}
function requireSession(state, sessionId) {
    const session = state.sessions[sessionId];
    if (!session)
        fail('练习已失效，请重新开始');
    return session;
}
function requireQuestion(questionId) {
    const question = getQuestion(questionId);
    if (!question)
        fail('题目不存在或已下架');
    return question;
}
function subjectStats(state, subjectId, sourceRecords = state.answerRecords) {
    const builtInQuestionIds = new Set(questions_1.QUESTIONS.filter((item) => item.subjectId === subjectId).map((item) => item.id));
    const records = sourceRecords.filter((item) => item.subjectId === subjectId && builtInQuestionIds.has(item.questionId));
    const correct = records.filter((item) => item.correct).length;
    const totalQuestions = builtInQuestionIds.size;
    const answeredQuestionIds = new Set(records.map((item) => item.questionId));
    return {
        total: totalQuestions,
        answered: answeredQuestionIds.size,
        attempts: records.length,
        correct,
        accuracy: (0, format_1.percent)(correct, records.length),
        progress: (0, format_1.percent)(answeredQuestionIds.size, totalQuestions),
    };
}
function scopeQuestionIds(state, config) {
    var _a, _b, _c;
    const importedBank = getImportedBank(config.questionBankId);
    let questions = config.questionBankId
        ? [...((importedBank === null || importedBank === void 0 ? void 0 : importedBank.questions) || [])]
        : config.practiceType === 'WRONG' || config.practiceType === 'FAVORITE'
            ? allQuestions()
            : [...questions_1.QUESTIONS];
    if (config.examId) {
        const subjectIds = new Set(catalog_1.SUBJECTS.filter((item) => item.examId === config.examId).map((item) => item.id));
        questions = questions.filter((item) => subjectIds.has(item.subjectId));
    }
    if (config.subjectId)
        questions = questions.filter((item) => item.subjectId === config.subjectId);
    if ((_a = config.chapterIds) === null || _a === void 0 ? void 0 : _a.length) {
        const chapterIds = new Set(config.chapterIds);
        questions = questions.filter((item) => chapterIds.has(item.chapterId));
    }
    if ((_b = config.knowledgePointIds) === null || _b === void 0 ? void 0 : _b.length) {
        const ids = new Set(config.knowledgePointIds);
        questions = questions.filter((item) => item.knowledgePointIds.some((id) => ids.has(id)));
    }
    if ((_c = config.difficulty) === null || _c === void 0 ? void 0 : _c.length) {
        const difficulty = new Set(config.difficulty);
        questions = questions.filter((item) => difficulty.has(item.difficulty));
    }
    if (config.practiceType === 'WRONG') {
        const wrongIds = new Set(Object.values(state.wrongQuestions)
            .filter((item) => item.masteryStatus === 'UNMASTERED')
            .map((item) => item.questionId));
        questions = questions.filter((item) => wrongIds.has(item.id));
    }
    if (config.practiceType === 'FAVORITE') {
        const favoriteIds = new Set(state.favoriteQuestionIds);
        questions = questions.filter((item) => favoriteIds.has(item.id));
    }
    questions.sort((left, right) => left.sort - right.sort);
    if (config.practiceType === 'RANDOM') {
        questions = (0, answer_1.shuffled)(questions);
    }
    else {
        const lastAnsweredAt = new Map();
        state.answerRecords.forEach((record) => {
            const answeredAt = new Date(record.answeredAt).getTime();
            const previous = lastAnsweredAt.get(record.questionId) || 0;
            if (answeredAt > previous)
                lastAnsweredAt.set(record.questionId, answeredAt);
        });
        questions.sort((left, right) => {
            const recencyDifference = (lastAnsweredAt.get(left.id) || 0) - (lastAnsweredAt.get(right.id) || 0);
            return recencyDifference || left.sort - right.sort;
        });
    }
    return questions.map((item) => item.id);
}
function questionView(state, questionId) {
    const question = requireQuestion(questionId);
    const material = getMaterial(question.materialId);
    return {
        ...question,
        typeLabel: (0, format_1.questionTypeLabel)(question.type),
        originLabel: question.bankKind === 'CIVIL_REAL' ? '考公真题' : question.bankId ? '导入题' : '练习题',
        material,
        knowledgePoints: question.knowledgePointIds.map((id) => getKnowledgePoint(id)).filter(Boolean),
        favorite: state.favoriteQuestionIds.includes(question.id),
    };
}
function sessionCounts(session) {
    const answers = Object.values(session.answers);
    const correct = answers.filter((item) => item.result.correct).length;
    return {
        total: session.questionIds.length,
        answered: answers.length,
        correct,
        wrong: answers.length - correct,
        unanswered: Math.max(0, session.questionIds.length - answers.length),
        accuracy: (0, format_1.percent)(correct, answers.length),
        durationSeconds: answers.reduce((sum, item) => sum + (item.durationSeconds || 0), 0),
    };
}
function sessionCard(session) {
    return session.questionIds.map((questionId, index) => {
        const answer = session.answers[questionId];
        return {
            index,
            number: index + 1,
            questionId,
            status: !answer ? 'UNANSWERED' : answer.result.correct ? 'CORRECT' : 'WRONG',
            statusClass: !answer ? 'unanswered' : answer.result.correct ? 'correct' : 'wrong',
        };
    });
}
function progressForBook(state, bookId) {
    const book = getBook(bookId);
    if (!book)
        return { total: 0, learned: 0, mastered: 0, due: 0, progress: 0 };
    const learned = book.wordIds.filter((id) => Boolean(state.wordLearning[id])).length;
    const mastered = book.wordIds.filter((id) => { var _a; return ((_a = state.wordLearning[id]) === null || _a === void 0 ? void 0 : _a.masteryLevel) === 3; }).length;
    const now = Date.now();
    const due = book.wordIds.filter((id) => {
        const record = state.wordLearning[id];
        return Boolean(record && new Date(record.nextReviewAt).getTime() <= now);
    }).length;
    return { total: book.wordIds.length, learned, mastered, due, progress: (0, format_1.percent)(learned, book.wordIds.length) };
}
function currentBook(state) {
    return getBook(state.currentBookId) || words_1.WORD_BOOKS[0];
}
function aggregateDaily(state, period) {
    const start = (0, date_1.periodStart)(period).getTime();
    const records = Object.values(state.dailyStats).filter((item) => new Date(`${item.date}T00:00:00`).getTime() >= start);
    return records.reduce((sum, item) => ({
        studyDurationSeconds: sum.studyDurationSeconds + item.studyDurationSeconds,
        newWordCount: sum.newWordCount + item.newWordCount,
        reviewWordCount: sum.reviewWordCount + item.reviewWordCount,
        questionCount: sum.questionCount + item.questionCount,
        correctCount: sum.correctCount + item.correctCount,
        wrongCount: sum.wrongCount + item.wrongCount,
        finishedSessionCount: sum.finishedSessionCount + item.finishedSessionCount,
    }), { studyDurationSeconds: 0, newWordCount: 0, reviewWordCount: 0, questionCount: 0, correctCount: 0, wrongCount: 0, finishedSessionCount: 0 });
}
function consecutiveDays(state) {
    const active = new Set(Object.values(state.dailyStats)
        .filter((item) => item.questionCount + item.newWordCount + item.reviewWordCount > 0)
        .map((item) => item.date));
    let cursor = new Date();
    if (!active.has((0, date_1.dateKey)(cursor)))
        cursor = (0, date_1.addDays)(cursor, -1);
    let streak = 0;
    while (active.has((0, date_1.dateKey)(cursor))) {
        streak += 1;
        cursor = (0, date_1.addDays)(cursor, -1);
    }
    return streak;
}
function subjectAnalysis(state, sourceRecords = state.answerRecords) {
    return catalog_1.SUBJECTS.map((subject) => ({
        ...subject,
        ...subjectStats(state, subject.id, sourceRecords),
    })).sort((left, right) => right.attempts - left.attempts || right.accuracy - left.accuracy);
}
function weakPoints(state, sourceRecords = state.answerRecords) {
    const buckets = {};
    sourceRecords.forEach((record) => {
        record.knowledgePointIds.forEach((knowledgePointId) => {
            if (!buckets[knowledgePointId])
                buckets[knowledgePointId] = { total: 0, correct: 0 };
            buckets[knowledgePointId].total += 1;
            if (record.correct)
                buckets[knowledgePointId].correct += 1;
        });
    });
    return Object.entries(buckets)
        .map(([knowledgePointId, value]) => {
        const knowledge = getKnowledgePoint(knowledgePointId);
        const chapter = getChapter(knowledge.chapterId);
        const subject = getSubject(chapter.subjectId);
        return {
            knowledgePointId,
            knowledgePointName: knowledge.name,
            chapterId: chapter.id,
            chapterName: chapter.name,
            subjectId: subject.id,
            subjectName: subject.name,
            total: value.total,
            correct: value.correct,
            accuracy: (0, format_1.percent)(value.correct, value.total),
        };
    })
        .sort((left, right) => left.accuracy - right.accuracy || right.total - left.total)
        .slice(0, 6);
}
function historyItems(state) {
    return Object.values(state.sessions)
        .filter((session) => Object.keys(session.answers).length > 0)
        .sort((left, right) => new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime())
        .map((session) => {
        var _a;
        const counts = sessionCounts(session);
        const subject = getSubject(session.config.subjectId);
        const bank = getImportedBank(session.config.questionBankId);
        return {
            id: session.id,
            title: (bank === null || bank === void 0 ? void 0 : bank.title) || (subject === null || subject === void 0 ? void 0 : subject.name) || ((_a = getExam(session.config.examId)) === null || _a === void 0 ? void 0 : _a.shortName) || '综合练习',
            mode: (0, format_1.modeLabel)(session.config.practiceType),
            status: session.status,
            date: (0, date_1.friendlyDate)(session.startedAt),
            time: (0, date_1.timeLabel)(session.startedAt),
            ...counts,
            durationLabel: (0, format_1.durationLabel)(counts.durationSeconds),
        };
    });
}
function wordView(state, wordId) {
    const word = getWord(wordId);
    if (!word)
        fail('单词不存在');
    const learning = state.wordLearning[wordId];
    return {
        ...word,
        favorite: state.favoriteWordIds.includes(wordId),
        masteryLevel: learning === null || learning === void 0 ? void 0 : learning.masteryLevel,
        masteryLabel: learning ? (0, format_1.ratingLabel)(learning.masteryLevel) : '未学习',
        nextReviewAt: learning === null || learning === void 0 ? void 0 : learning.nextReviewAt,
    };
}
exports.api = {
    async initialize() {
        return response(() => (0, state_1.initializeState)(), 0);
    },
    async login(nickname = '学习者') {
        return response(() => {
            const state = (0, state_1.loadState)();
            if (!state.user) {
                state.user = {
                    id: 'user-local-001',
                    nickname: nickname.trim() || '学习者',
                    avatarUrl: '',
                    registeredAt: new Date().toISOString(),
                };
            }
            (0, state_1.saveState)(state);
            return state.user;
        }, 180);
    },
    async logout() {
        return response(() => {
            const state = (0, state_1.loadState)();
            state.user = null;
            (0, state_1.saveState)(state);
            return true;
        });
    },
    async getProfile() {
        return response(() => (0, state_1.loadState)().user, 0);
    },
    async updateProfile(input) {
        return response(() => {
            const state = (0, state_1.loadState)();
            if (!state.user)
                fail('请先登录');
            state.user = { ...state.user, ...input };
            (0, state_1.saveState)(state);
            return state.user;
        });
    },
    async getSettings() {
        return response(() => (0, state_1.loadState)().settings);
    },
    async updateSettings(settings) {
        return response(() => {
            const state = (0, state_1.loadState)();
            state.settings = { ...state.settings, ...settings };
            (0, state_1.saveState)(state);
            return state.settings;
        });
    },
    async resetDemo() {
        return response(() => (0, state_1.resetState)());
    },
    async getHome() {
        return response(() => {
            var _a, _b;
            const state = (0, state_1.loadState)();
            const today = (0, state_1.ensureDaily)(state);
            (0, state_1.saveState)(state);
            const unfinished = Object.values(state.sessions)
                .filter((item) => item.status === 'IN_PROGRESS')
                .sort((left, right) => new Date(right.lastActiveAt).getTime() - new Date(left.lastActiveAt).getTime())[0];
            const hour = new Date().getHours();
            const greeting = hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 19 ? '下午好' : '晚上好';
            const history = historyItems(state).slice(0, 3);
            const book = currentBook(state);
            const bookProgress = progressForBook(state, book.id);
            return {
                user: state.user,
                greeting,
                continuousStudyDays: consecutiveDays(state),
                todayQuestionCount: today.questionCount,
                todayWordCount: today.newWordCount + today.reviewWordCount,
                todayStudyMinutes: Math.ceil(today.studyDurationSeconds / 60),
                questionTarget: state.settings.dailyQuestionTarget,
                wordTarget: state.settings.dailyWordTarget,
                studyTarget: state.settings.dailyStudyMinutes,
                questionProgress: (0, format_1.percent)(today.questionCount, state.settings.dailyQuestionTarget),
                wordProgress: (0, format_1.percent)(today.newWordCount + today.reviewWordCount, state.settings.dailyWordTarget),
                studyProgress: (0, format_1.percent)(Math.ceil(today.studyDurationSeconds / 60), state.settings.dailyStudyMinutes),
                currentBook: { ...book, ...bookProgress },
                unfinished: unfinished
                    ? {
                        sessionId: unfinished.id,
                        title: ((_a = getImportedBank(unfinished.config.questionBankId)) === null || _a === void 0 ? void 0 : _a.title) || ((_b = getSubject(unfinished.config.subjectId)) === null || _b === void 0 ? void 0 : _b.name) || '综合练习',
                        current: unfinished.currentIndex + 1,
                        total: unfinished.questionIds.length,
                        answered: Object.keys(unfinished.answers).length,
                    }
                    : null,
                recent: history,
            };
        });
    },
    async getStudyDashboard() {
        return response(() => {
            const state = (0, state_1.loadState)();
            const today = (0, state_1.ensureDaily)(state);
            const trend = Array.from({ length: 7 }, (_, offset) => {
                const date = (0, date_1.addDays)(new Date(), offset - 6);
                const item = state.dailyStats[(0, date_1.dateKey)(date)];
                const total = item ? item.questionCount + item.newWordCount + item.reviewWordCount : 0;
                return { date: (0, date_1.dateKey)(date), label: (0, date_1.weekdayLabel)(date), total, height: Math.max(6, Math.min(100, total * 5)) };
            });
            (0, state_1.saveState)(state);
            return {
                today,
                todayStudyMinutes: Math.ceil(today.studyDurationSeconds / 60),
                questionTarget: state.settings.dailyQuestionTarget,
                wordTarget: state.settings.dailyWordTarget,
                studyTarget: state.settings.dailyStudyMinutes,
                questionProgress: (0, format_1.percent)(today.questionCount, state.settings.dailyQuestionTarget),
                wordProgress: (0, format_1.percent)(today.newWordCount + today.reviewWordCount, state.settings.dailyWordTarget),
                studyProgress: (0, format_1.percent)(Math.ceil(today.studyDurationSeconds / 60), state.settings.dailyStudyMinutes),
                trend,
                recent: historyItems(state).slice(0, 3),
                weakPoints: weakPoints(state).slice(0, 3),
            };
        });
    },
    async listExams() {
        return response(() => {
            const state = (0, state_1.loadState)();
            return catalog_1.EXAMS.map((exam) => {
                const subjects = catalog_1.SUBJECTS.filter((item) => item.examId === exam.id);
                const stats = subjects.map((item) => subjectStats(state, item.id));
                const attempts = stats.reduce((sum, item) => sum + item.attempts, 0);
                const correct = stats.reduce((sum, item) => sum + item.correct, 0);
                return { ...exam, subjectCount: subjects.length, questionCount: stats.reduce((sum, item) => sum + item.total, 0), accuracy: (0, format_1.percent)(correct, attempts) };
            });
        });
    },
    async getImportedQuestionOverview() {
        return response(() => {
            const banks = importedBanks();
            const summarize = (kind) => {
                const items = banks.filter((item) => item.kind === kind);
                return {
                    bankCount: items.length,
                    questionCount: items.reduce((sum, item) => sum + item.questions.length, 0),
                };
            };
            return { civilReal: summarize('CIVIL_REAL'), other: summarize('OTHER') };
        }, 20);
    },
    async listImportedQuestionBanks(kind) {
        return response(() => {
            const state = (0, state_1.loadState)();
            return importedBanks()
                .filter((item) => !kind || item.kind === kind)
                .map((bank) => {
                const questionIds = new Set(bank.questionIds);
                const records = state.answerRecords.filter((record) => questionIds.has(record.questionId));
                const answered = new Set(records.map((record) => record.questionId)).size;
                const correct = records.filter((record) => record.correct).length;
                return {
                    id: bank.id,
                    title: bank.title,
                    kind: bank.kind,
                    kindLabel: bank.kind === 'CIVIL_REAL' ? '考公真题' : '其他题库',
                    source: bank.source,
                    year: bank.year,
                    fileName: bank.fileName,
                    importedAt: bank.importedAt,
                    importedDate: (0, date_1.friendlyDate)(bank.importedAt),
                    questionCount: bank.questions.length,
                    answered,
                    accuracy: (0, format_1.percent)(correct, records.length),
                };
            })
                .sort((left, right) => new Date(right.importedAt).getTime() - new Date(left.importedAt).getTime());
        }, 20);
    },
    async importQuestionBank(input, kind, fileName) {
        return response(() => {
            const existing = importedBanks();
            const sameBank = existing.find((item) => item.kind === kind
                && item.title === input.title
                && item.year === input.year
                && item.questions.length === input.questions.length
                && item.questions.slice(0, 3).map((question) => question.stem).join('|') === input.questions.slice(0, 3).map((question) => question.stem).join('|'));
            if (sameBank)
                fail('这套题已经导入过了');
            const bankId = (0, answer_1.uniqueId)('bank');
            const materials = [];
            const questions = [];
            const answerKeys = [];
            input.questions.forEach((item, index) => {
                const questionId = `${bankId}-q-${index + 1}`;
                let materialId;
                if (item.material) {
                    materialId = `${bankId}-m-${index + 1}`;
                    materials.push({ id: materialId, subjectId: item.subjectId, ...item.material });
                }
                questions.push({
                    id: questionId,
                    subjectId: item.subjectId,
                    chapterId: item.chapterId,
                    knowledgePointIds: item.knowledgePointIds,
                    materialId,
                    type: item.type,
                    stem: item.stem,
                    options: item.options,
                    difficulty: item.difficulty,
                    source: item.source,
                    year: item.year,
                    sort: index + 1,
                    bankId,
                    bankKind: kind,
                });
                answerKeys.push({ questionId, correctKeys: item.answerKeys, analysis: item.analysis });
            });
            const bank = {
                id: bankId,
                title: input.title,
                kind,
                source: input.source,
                year: input.year,
                fileName,
                importedAt: new Date().toISOString(),
                subjectIds: Array.from(new Set(questions.map((item) => item.subjectId))),
                questionIds: questions.map((item) => item.id),
                questions,
                materials,
                answerKeys,
            };
            (0, question_banks_1.saveImportedQuestionBank)(bank);
            return { id: bank.id, title: bank.title, kind: bank.kind, questionCount: bank.questions.length };
        }, 80);
    },
    async getExamDetail(examId) {
        return response(() => {
            const state = (0, state_1.loadState)();
            const exam = getExam(examId);
            if (!exam)
                fail('考试分类不存在');
            const subjects = catalog_1.SUBJECTS.filter((item) => item.examId === examId).map((item) => ({ ...item, ...subjectStats(state, item.id) }));
            return { exam, subjects };
        });
    },
    async getSubjectDetail(subjectId) {
        return response(() => {
            const state = (0, state_1.loadState)();
            const subject = getSubject(subjectId);
            if (!subject)
                fail('科目不存在');
            const exam = getExam(subject.examId);
            const chapters = catalog_1.CHAPTERS.filter((item) => item.subjectId === subjectId)
                .sort((left, right) => left.sort - right.sort)
                .map((chapter) => {
                const questionIds = questions_1.QUESTIONS.filter((item) => item.chapterId === chapter.id).map((item) => item.id);
                const records = state.answerRecords.filter((item) => questionIds.includes(item.questionId));
                const correct = records.filter((item) => item.correct).length;
                return { ...chapter, total: questionIds.length, attempts: records.length, accuracy: (0, format_1.percent)(correct, records.length) };
            });
            return { exam, subject, stats: subjectStats(state, subjectId), chapters };
        });
    },
    async getChapterDetail(chapterId) {
        return response(() => {
            const state = (0, state_1.loadState)();
            const chapter = getChapter(chapterId);
            if (!chapter)
                fail('章节不存在');
            const subject = getSubject(chapter.subjectId);
            const knowledgePoints = catalog_1.KNOWLEDGE_POINTS.filter((item) => item.chapterId === chapterId).map((point) => {
                const questionIds = questions_1.QUESTIONS.filter((item) => item.knowledgePointIds.includes(point.id)).map((item) => item.id);
                const records = state.answerRecords.filter((item) => questionIds.includes(item.questionId));
                const correct = records.filter((item) => item.correct).length;
                return { ...point, total: questionIds.length, attempts: records.length, accuracy: (0, format_1.percent)(correct, records.length) };
            });
            return { chapter, subject, exam: getExam(subject.examId), knowledgePoints };
        });
    },
    async getAvailableQuestionCount(config) {
        return response(() => scopeQuestionIds((0, state_1.loadState)(), config).length, 20);
    },
    async createSession(config) {
        return response(() => {
            var _a;
            const state = (0, state_1.loadState)();
            const available = scopeQuestionIds(state, config);
            if (!available.length)
                fail(config.practiceType === 'WRONG' ? '暂无未掌握错题' : config.practiceType === 'FAVORITE' ? '还没有收藏题目' : '当前范围暂无可用题目');
            const questionIds = available.slice(0, Math.max(1, Math.min(config.count || available.length, available.length)));
            const now = new Date().toISOString();
            const session = {
                id: (0, answer_1.uniqueId)('session'),
                userId: ((_a = state.user) === null || _a === void 0 ? void 0 : _a.id) || 'guest',
                config: { ...config, count: questionIds.length },
                questionIds,
                currentIndex: 0,
                answers: {},
                status: 'IN_PROGRESS',
                startedAt: now,
                lastActiveAt: now,
            };
            state.sessions[session.id] = session;
            (0, state_1.saveState)(state);
            return { sessionId: session.id, total: questionIds.length };
        }, 160);
    },
    async getSession(sessionId) {
        return response(() => {
            const state = (0, state_1.loadState)();
            const session = requireSession(state, sessionId);
            const subject = getSubject(session.config.subjectId);
            return { session, subject, bank: getImportedBank(session.config.questionBankId), counts: sessionCounts(session), card: sessionCard(session) };
        });
    },
    async getPracticeQuestion(sessionId, index) {
        return response(() => {
            const state = (0, state_1.loadState)();
            const session = requireSession(state, sessionId);
            const safeIndex = Math.max(0, Math.min(typeof index === 'number' ? index : session.currentIndex, session.questionIds.length - 1));
            session.currentIndex = safeIndex;
            session.lastActiveAt = new Date().toISOString();
            const questionId = session.questionIds[safeIndex];
            const answer = session.answers[questionId];
            (0, state_1.saveState)(state);
            return {
                sessionId,
                index: safeIndex,
                number: safeIndex + 1,
                total: session.questionIds.length,
                question: questionView(state, questionId),
                selectedKeys: (answer === null || answer === void 0 ? void 0 : answer.userKeys) || [],
                submitted: Boolean(answer),
                result: (answer === null || answer === void 0 ? void 0 : answer.result) || null,
                counts: sessionCounts(session),
            };
        }, 45);
    },
    async setSessionIndex(sessionId, index) {
        return response(() => {
            const state = (0, state_1.loadState)();
            const session = requireSession(state, sessionId);
            session.currentIndex = Math.max(0, Math.min(index, session.questionIds.length - 1));
            session.lastActiveAt = new Date().toISOString();
            (0, state_1.saveState)(state);
            return session.currentIndex;
        }, 0);
    },
    async submitAnswer(sessionId, questionId, selectedKeys, durationSeconds = 0) {
        return response(() => {
            const state = (0, state_1.loadState)();
            const session = requireSession(state, sessionId);
            if (!session.questionIds.includes(questionId))
                fail('题目不属于本次练习');
            if (session.answers[questionId])
                return session.answers[questionId].result;
            const keys = (0, answer_1.normalizeKeys)(selectedKeys);
            if (!keys.length)
                fail('请先选择答案');
            const question = requireQuestion(questionId);
            const optionKeys = new Set(question.options.map((item) => item.key));
            if (keys.some((key) => !optionKeys.has(key)))
                fail('答案选项无效');
            if (question.type !== 'MULTIPLE' && keys.length !== 1)
                fail('该题只能选择一个答案');
            const answerKey = getAnswerKey(questionId);
            if (!answerKey)
                fail('题目答案配置缺失');
            const correct = (0, answer_1.answersEqual)(keys, answerKey.correctKeys);
            const now = new Date().toISOString();
            const result = {
                correct,
                userKeys: keys,
                correctKeys: answerKey.correctKeys,
                analysis: answerKey.analysis,
                knowledgePoints: question.knowledgePointIds.map((id) => { var _a; return (_a = getKnowledgePoint(id)) === null || _a === void 0 ? void 0 : _a.name; }).filter(Boolean),
            };
            session.answers[questionId] = {
                questionId,
                userKeys: keys,
                durationSeconds: Math.max(0, Math.round(durationSeconds || 0)),
                answeredAt: now,
                result,
            };
            session.lastActiveAt = now;
            state.answerRecords.push({
                id: (0, answer_1.uniqueId)('answer'),
                sessionId,
                questionId,
                subjectId: question.subjectId,
                knowledgePointIds: question.knowledgePointIds,
                userKeys: keys,
                correctKeys: answerKey.correctKeys,
                correct,
                durationSeconds: Math.max(0, Math.round(durationSeconds || 0)),
                answeredAt: now,
            });
            const existingWrong = state.wrongQuestions[questionId];
            if (!correct) {
                state.wrongQuestions[questionId] = existingWrong
                    ? { ...existingWrong, wrongCount: existingWrong.wrongCount + 1, lastWrongAnswer: keys, masteryStatus: 'UNMASTERED', correctStreak: 0, lastWrongAt: now, masteredAt: undefined }
                    : { questionId, wrongCount: 1, lastWrongAnswer: keys, masteryStatus: 'UNMASTERED', correctStreak: 0, firstWrongAt: now, lastWrongAt: now };
            }
            else if (session.config.practiceType === 'WRONG' && existingWrong) {
                const streak = existingWrong.correctStreak + 1;
                state.wrongQuestions[questionId] = {
                    ...existingWrong,
                    correctStreak: streak,
                    masteryStatus: streak >= 3 ? 'MASTERED' : existingWrong.masteryStatus,
                    masteredAt: streak >= 3 ? now : existingWrong.masteredAt,
                };
            }
            const daily = (0, state_1.ensureDaily)(state);
            daily.questionCount += 1;
            daily.studyDurationSeconds += Math.max(5, Math.round(durationSeconds || 0));
            if (correct)
                daily.correctCount += 1;
            else
                daily.wrongCount += 1;
            (0, state_1.saveState)(state);
            return result;
        }, 220);
    },
    async finishSession(sessionId) {
        return response(() => {
            const state = (0, state_1.loadState)();
            const session = requireSession(state, sessionId);
            if (!Object.keys(session.answers).length)
                fail('至少完成一道题后再结束练习');
            if (session.status !== 'FINISHED') {
                session.status = 'FINISHED';
                session.finishedAt = new Date().toISOString();
                (0, state_1.ensureDaily)(state).finishedSessionCount += 1;
                (0, state_1.saveState)(state);
            }
            return sessionCounts(session);
        });
    },
    async abandonSession(sessionId) {
        return response(() => {
            const state = (0, state_1.loadState)();
            const session = requireSession(state, sessionId);
            session.status = 'ABANDONED';
            session.lastActiveAt = new Date().toISOString();
            (0, state_1.saveState)(state);
            return true;
        });
    },
    async getSessionResult(sessionId) {
        return response(() => {
            var _a, _b, _c;
            const state = (0, state_1.loadState)();
            const session = requireSession(state, sessionId);
            const counts = sessionCounts(session);
            const knowledgeBuckets = {};
            Object.values(session.answers).forEach((answer) => {
                const question = requireQuestion(answer.questionId);
                question.knowledgePointIds.forEach((id) => {
                    if (!knowledgeBuckets[id])
                        knowledgeBuckets[id] = { total: 0, correct: 0 };
                    knowledgeBuckets[id].total += 1;
                    if (answer.result.correct)
                        knowledgeBuckets[id].correct += 1;
                });
            });
            const knowledgeStats = Object.entries(knowledgeBuckets)
                .map(([id, item]) => { var _a; return ({ id, name: ((_a = getKnowledgePoint(id)) === null || _a === void 0 ? void 0 : _a.name) || '知识点', ...item, accuracy: (0, format_1.percent)(item.correct, item.total) }); })
                .sort((left, right) => left.accuracy - right.accuracy);
            return {
                sessionId,
                title: ((_a = getImportedBank(session.config.questionBankId)) === null || _a === void 0 ? void 0 : _a.title) || ((_b = getSubject(session.config.subjectId)) === null || _b === void 0 ? void 0 : _b.name) || ((_c = getExam(session.config.examId)) === null || _c === void 0 ? void 0 : _c.shortName) || '本次练习',
                mode: (0, format_1.modeLabel)(session.config.practiceType),
                ...counts,
                durationLabel: (0, format_1.durationLabel)(counts.durationSeconds),
                knowledgeStats,
                card: sessionCard(session),
            };
        });
    },
    async toggleFavoriteQuestion(questionId) {
        return response(() => {
            requireQuestion(questionId);
            const state = (0, state_1.loadState)();
            const exists = state.favoriteQuestionIds.includes(questionId);
            state.favoriteQuestionIds = exists ? state.favoriteQuestionIds.filter((id) => id !== questionId) : [questionId, ...state.favoriteQuestionIds];
            (0, state_1.saveState)(state);
            return !exists;
        }, 60);
    },
    async listWrongQuestions(filter = {}) {
        return response(() => {
            const state = (0, state_1.loadState)();
            const subjectIds = filter.examId ? new Set(catalog_1.SUBJECTS.filter((item) => item.examId === filter.examId).map((item) => item.id)) : null;
            return Object.values(state.wrongQuestions)
                .filter((record) => !filter.masteryStatus || record.masteryStatus === filter.masteryStatus)
                .map((record) => ({ record, question: getQuestion(record.questionId) }))
                .filter((item) => item.question && (!subjectIds || subjectIds.has(item.question.subjectId)))
                .sort((left, right) => new Date(right.record.lastWrongAt).getTime() - new Date(left.record.lastWrongAt).getTime())
                .map((item) => {
                var _a, _b;
                return ({
                    ...item.record,
                    questionId: item.question.id,
                    stem: item.question.stem,
                    typeLabel: (0, format_1.questionTypeLabel)(item.question.type),
                    originLabel: item.question.bankKind === 'CIVIL_REAL' ? '考公真题' : item.question.bankId ? '导入题' : '练习题',
                    subject: (_a = getSubject(item.question.subjectId)) === null || _a === void 0 ? void 0 : _a.name,
                    chapter: (_b = getChapter(item.question.chapterId)) === null || _b === void 0 ? void 0 : _b.name,
                    lastWrongDate: (0, date_1.friendlyDate)(item.record.lastWrongAt),
                });
            });
        });
    },
    async setWrongMastery(questionId, mastered) {
        return response(() => {
            const state = (0, state_1.loadState)();
            const record = state.wrongQuestions[questionId];
            if (!record)
                fail('错题记录不存在');
            record.masteryStatus = mastered ? 'MASTERED' : 'UNMASTERED';
            record.masteredAt = mastered ? new Date().toISOString() : undefined;
            if (!mastered)
                record.correctStreak = 0;
            (0, state_1.saveState)(state);
            return record;
        });
    },
    async removeWrongQuestion(questionId) {
        return response(() => {
            const state = (0, state_1.loadState)();
            delete state.wrongQuestions[questionId];
            (0, state_1.saveState)(state);
            return true;
        });
    },
    async listFavoriteQuestions(filter = {}) {
        return response(() => {
            const state = (0, state_1.loadState)();
            const subjectIds = filter.examId ? new Set(catalog_1.SUBJECTS.filter((item) => item.examId === filter.examId).map((item) => item.id)) : null;
            return state.favoriteQuestionIds
                .map((id) => getQuestion(id))
                .filter((item) => item && (!subjectIds || subjectIds.has(item.subjectId)))
                .map((question) => {
                var _a, _b;
                return ({
                    questionId: question.id,
                    stem: question.stem,
                    typeLabel: (0, format_1.questionTypeLabel)(question.type),
                    originLabel: question.bankKind === 'CIVIL_REAL' ? '考公真题' : question.bankId ? '导入题' : '练习题',
                    subject: (_a = getSubject(question.subjectId)) === null || _a === void 0 ? void 0 : _a.name,
                    chapter: (_b = getChapter(question.chapterId)) === null || _b === void 0 ? void 0 : _b.name,
                });
            });
        });
    },
    async listHistory() {
        return response(() => historyItems((0, state_1.loadState)()));
    },
    async getHistoryDetail(sessionId) {
        return response(() => {
            var _a, _b;
            const state = (0, state_1.loadState)();
            const session = requireSession(state, sessionId);
            const counts = sessionCounts(session);
            const items = session.questionIds.map((questionId, index) => {
                const question = requireQuestion(questionId);
                const answer = session.answers[questionId];
                return {
                    number: index + 1,
                    questionId,
                    stem: question.stem,
                    answered: Boolean(answer),
                    correct: answer === null || answer === void 0 ? void 0 : answer.result.correct,
                    userAnswer: (answer === null || answer === void 0 ? void 0 : answer.userKeys.join('、')) || '未作答',
                    correctAnswer: (answer === null || answer === void 0 ? void 0 : answer.result.correctKeys.join('、')) || '—',
                };
            });
            return {
                title: ((_a = getImportedBank(session.config.questionBankId)) === null || _a === void 0 ? void 0 : _a.title) || ((_b = getSubject(session.config.subjectId)) === null || _b === void 0 ? void 0 : _b.name) || '综合练习',
                mode: (0, format_1.modeLabel)(session.config.practiceType),
                date: `${(0, date_1.friendlyDate)(session.startedAt)} ${(0, date_1.timeLabel)(session.startedAt)}`,
                ...counts,
                durationLabel: (0, format_1.durationLabel)(counts.durationSeconds),
                items,
            };
        });
    },
    async listWordBooks() {
        return response(() => {
            const state = (0, state_1.loadState)();
            return words_1.WORD_BOOKS.map((book) => ({
                ...book,
                selected: state.selectedBookIds.includes(book.id),
                current: state.currentBookId === book.id,
                ...progressForBook(state, book.id),
            }));
        });
    },
    async getWordBookDetail(bookId) {
        return response(() => {
            const state = (0, state_1.loadState)();
            const book = getBook(bookId);
            if (!book)
                fail('词书不存在');
            return { ...book, selected: state.selectedBookIds.includes(bookId), current: state.currentBookId === bookId, ...progressForBook(state, bookId) };
        });
    },
    async selectWordBook(bookId) {
        return response(() => {
            const state = (0, state_1.loadState)();
            const book = getBook(bookId);
            if (!book)
                fail('词书不存在');
            if (!state.selectedBookIds.includes(bookId))
                state.selectedBookIds.push(bookId);
            state.currentBookId = bookId;
            (0, state_1.saveState)(state);
            return book;
        });
    },
    async getWordHome() {
        return response(() => {
            const state = (0, state_1.loadState)();
            const book = currentBook(state);
            const progress = progressForBook(state, book.id);
            const today = (0, state_1.ensureDaily)(state);
            (0, state_1.saveState)(state);
            return {
                book: { ...book, ...progress },
                todayNew: today.newWordCount,
                todayReview: today.reviewWordCount,
                newRemaining: Math.max(0, Math.min(state.settings.dailyWordTarget - today.newWordCount, progress.total - progress.learned)),
                reviewRemaining: progress.due,
                wordTarget: state.settings.dailyWordTarget,
            };
        });
    },
    async getWordQueue(mode) {
        return response(() => {
            const state = (0, state_1.loadState)();
            const book = currentBook(state);
            const now = Date.now();
            let ids = [...book.wordIds];
            if (mode === 'NEW')
                ids = ids.filter((id) => !state.wordLearning[id]);
            if (mode === 'REVIEW')
                ids = ids.filter((id) => state.wordLearning[id] && new Date(state.wordLearning[id].nextReviewAt).getTime() <= now);
            if (mode === 'FAVORITE')
                ids = ids.filter((id) => state.favoriteWordIds.includes(id));
            const limit = mode === 'NEW' ? state.settings.dailyWordTarget : Math.max(20, state.settings.dailyWordTarget);
            return { mode, book, words: ids.slice(0, limit).map((id) => wordView(state, id)) };
        });
    },
    async rateWord(wordId, rating, mode, durationSeconds = 0) {
        return response(() => {
            const state = (0, state_1.loadState)();
            const word = getWord(wordId);
            if (!word)
                fail('单词不存在');
            const now = new Date();
            const existing = state.wordLearning[wordId];
            const wasNew = !existing;
            const nextReview = rating === 0 ? (0, date_1.addMinutes)(now, 10) : (0, date_1.addDays)(now, rating === 1 ? 1 : rating === 2 ? 3 : 7);
            state.wordLearning[wordId] = existing
                ? {
                    ...existing,
                    masteryLevel: rating,
                    studyCount: existing.studyCount + 1,
                    correctCount: existing.correctCount + (rating >= 2 ? 1 : 0),
                    wrongCount: existing.wrongCount + (rating === 0 ? 1 : 0),
                    lastRating: rating,
                    lastStudyAt: now.toISOString(),
                    nextReviewAt: nextReview.toISOString(),
                }
                : {
                    wordId,
                    masteryLevel: rating,
                    studyCount: 1,
                    correctCount: rating >= 2 ? 1 : 0,
                    wrongCount: rating === 0 ? 1 : 0,
                    lastRating: rating,
                    firstStudyAt: now.toISOString(),
                    lastStudyAt: now.toISOString(),
                    nextReviewAt: nextReview.toISOString(),
                };
            state.wordLogs.push({
                id: (0, answer_1.uniqueId)('word-log'),
                wordId,
                wordBookId: currentBook(state).id,
                actionType: mode,
                rating,
                durationSeconds: Math.max(1, Math.round(durationSeconds || 0)),
                learnedAt: now.toISOString(),
                nextReviewAt: nextReview.toISOString(),
            });
            const daily = (0, state_1.ensureDaily)(state);
            if (wasNew && mode === 'NEW')
                daily.newWordCount += 1;
            else
                daily.reviewWordCount += 1;
            daily.studyDurationSeconds += Math.max(3, Math.round(durationSeconds || 0));
            (0, state_1.saveState)(state);
            return { nextReviewAt: nextReview.toISOString(), nextReviewLabel: rating === 0 ? '10 分钟后' : rating === 1 ? '1 天后' : rating === 2 ? '3 天后' : '7 天后' };
        }, 130);
    },
    async toggleFavoriteWord(wordId) {
        return response(() => {
            if (!getWord(wordId))
                fail('单词不存在');
            const state = (0, state_1.loadState)();
            const exists = state.favoriteWordIds.includes(wordId);
            state.favoriteWordIds = exists ? state.favoriteWordIds.filter((id) => id !== wordId) : [wordId, ...state.favoriteWordIds];
            (0, state_1.saveState)(state);
            return !exists;
        }, 50);
    },
    async listFavoriteWords(query = '', mastery = '') {
        return response(() => {
            const state = (0, state_1.loadState)();
            const keyword = query.trim().toLowerCase();
            return state.favoriteWordIds
                .map((id) => wordView(state, id))
                .filter((item) => !keyword || item.spelling.toLowerCase().includes(keyword) || item.meaning.includes(keyword))
                .filter((item) => { var _a; return mastery === '' || String((_a = item.masteryLevel) !== null && _a !== void 0 ? _a : '') === mastery; });
        });
    },
    async getWordProgress() {
        return response(() => {
            const state = (0, state_1.loadState)();
            const book = currentBook(state);
            const progress = progressForBook(state, book.id);
            const levels = [0, 1, 2, 3].map((level) => {
                const count = book.wordIds.filter((id) => { var _a; return ((_a = state.wordLearning[id]) === null || _a === void 0 ? void 0 : _a.masteryLevel) === level; }).length;
                return { level, label: (0, format_1.ratingLabel)(level), count, percentage: (0, format_1.percent)(count, progress.total) };
            });
            const today = (0, state_1.ensureDaily)(state);
            (0, state_1.saveState)(state);
            return { book, ...progress, levels, todayNew: today.newWordCount, todayReview: today.reviewWordCount };
        });
    },
    async createWordTests() {
        return response(() => {
            const state = (0, state_1.loadState)();
            const book = currentBook(state);
            const candidates = (0, answer_1.shuffled)(book.wordIds.map((id) => getWord(id)).filter(Boolean)).slice(0, Math.min(5, book.wordIds.length));
            return candidates.map((word) => {
                const distractors = (0, answer_1.shuffled)(words_1.WORDS.filter((item) => item.id !== word.id)).slice(0, 3);
                const options = (0, answer_1.shuffled)([word, ...distractors]).map((item, index) => ({ key: ['A', 'B', 'C', 'D'][index], content: item.meaning, wordId: item.id }));
                const id = (0, answer_1.uniqueId)('word-test');
                wordTestCache[id] = { correctKey: options.find((item) => item.wordId === word.id).key, wordId: word.id };
                return { id, prompt: word.spelling, phonetic: word.ukPhonetic, options: options.map(({ key, content }) => ({ key, content })) };
            });
        });
    },
    async submitWordTest(testId, selectedKey) {
        return response(() => {
            const cached = wordTestCache[testId];
            if (!cached)
                fail('测试已失效，请重新开始');
            return { correct: cached.correctKey === selectedKey, correctKey: cached.correctKey };
        }, 90);
    },
    async getStatistics(period) {
        return response(() => {
            const state = (0, state_1.loadState)();
            const daily = aggregateDaily(state, period);
            const start = (0, date_1.periodStart)(period).getTime();
            const periodRecords = state.answerRecords.filter((record) => new Date(record.answeredAt).getTime() >= start);
            const learnedWords = Object.keys(state.wordLearning).length;
            const masteredWords = Object.values(state.wordLearning).filter((item) => item.masteryLevel === 3).length;
            return {
                period,
                studyMinutes: Math.ceil(daily.studyDurationSeconds / 60),
                wordCount: daily.newWordCount + daily.reviewWordCount,
                newWordCount: daily.newWordCount,
                reviewWordCount: daily.reviewWordCount,
                questionCount: daily.questionCount,
                correctCount: daily.correctCount,
                wrongCount: daily.wrongCount,
                accuracy: (0, format_1.percent)(daily.correctCount, daily.questionCount),
                learnedWords,
                masteredWords,
                studyDays: Object.values(state.dailyStats).filter((item) => item.questionCount + item.newWordCount + item.reviewWordCount > 0).length,
                continuousStudyDays: consecutiveDays(state),
                subjects: subjectAnalysis(state, periodRecords),
                weakPoints: weakPoints(state, periodRecords),
            };
        });
    },
    async getCalendar(year, month) {
        return response(() => {
            const state = (0, state_1.loadState)();
            const first = new Date(year, month - 1, 1);
            const days = new Date(year, month, 0).getDate();
            const leading = first.getDay() === 0 ? 6 : first.getDay() - 1;
            const cells = Array.from({ length: leading }, (_, index) => ({ key: `blank-${index}`, blank: true }));
            for (let day = 1; day <= days; day += 1) {
                const date = new Date(year, month - 1, day);
                const key = (0, date_1.dateKey)(date);
                const record = state.dailyStats[key];
                const count = record ? record.questionCount + record.newWordCount + record.reviewWordCount : 0;
                cells.push({ key, day, date: key, active: count > 0, count, today: key === (0, date_1.dateKey)() });
            }
            return { year, month, cells, activeDays: cells.filter((item) => item.active).length };
        });
    },
    async getSubjectAnalysis() {
        return response(() => subjectAnalysis((0, state_1.loadState)()));
    },
    async getWeakPoints() {
        return response(() => weakPoints((0, state_1.loadState)()));
    },
};
