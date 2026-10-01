import { MOCK_DELAY_MS } from '../config/index';
import { ANSWER_KEYS } from '../data/answer-keys';
import { CHAPTERS, EXAMS, KNOWLEDGE_POINTS, SUBJECTS } from '../data/catalog';
import { MATERIALS, QUESTIONS } from '../data/questions';
import { WORD_BOOKS, WORDS } from '../data/words';
import { loadImportedQuestionBanks, saveImportedQuestionBank } from '../storage/question-banks';
import { ensureDaily, initializeState, loadState, resetState, saveState } from '../storage/state';
import type {
  AnswerKey,
  AppState,
  ImportedQuestionBank,
  PracticeConfig,
  PracticeQuestionVO,
  PracticeSession,
  Question,
  QuestionBankKind,
  QuestionMaterial,
  StatisticsPeriod,
  UserSettings,
  WordQueueMode,
  WordRating,
} from '../types/index';
import type { NormalizedQuestionBankImport } from './question-import';
import { answersEqual, normalizeKeys, shuffled, uniqueId } from '../utils/answer';
import { addDays, addMinutes, dateKey, friendlyDate, periodStart, timeLabel, weekdayLabel } from '../utils/date';
import { durationLabel, modeLabel, percent, questionTypeLabel, ratingLabel } from '../utils/format';

const wordTestCache: Record<string, { correctKey: string; wordId: string }> = {};

function sleep(ms = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function response<T>(factory: () => T, delay = MOCK_DELAY_MS): Promise<T> {
  if (delay) await sleep(delay);
  return factory();
}

function fail(message: string): never {
  throw new Error(message);
}

function getExam(examId?: string) {
  return EXAMS.find((item) => item.id === examId);
}

function getSubject(subjectId?: string) {
  return SUBJECTS.find((item) => item.id === subjectId);
}

function getChapter(chapterId?: string) {
  return CHAPTERS.find((item) => item.id === chapterId);
}

function getKnowledgePoint(knowledgePointId?: string) {
  return KNOWLEDGE_POINTS.find((item) => item.id === knowledgePointId);
}

function importedBanks(): ImportedQuestionBank[] {
  return loadImportedQuestionBanks();
}

function getImportedBank(bankId?: string): ImportedQuestionBank | undefined {
  if (!bankId) return undefined;
  return importedBanks().find((item) => item.id === bankId);
}

function allQuestions(): Question[] {
  return [...QUESTIONS, ...importedBanks().reduce<Question[]>((items, bank) => items.concat(bank.questions), [])];
}

function getQuestion(questionId?: string): Question | undefined {
  if (!questionId) return undefined;
  return QUESTIONS.find((item) => item.id === questionId)
    || importedBanks().reduce<Question[]>((items, bank) => items.concat(bank.questions), []).find((item) => item.id === questionId);
}

function getMaterial(materialId?: string): QuestionMaterial | undefined {
  if (!materialId) return undefined;
  return MATERIALS.find((item) => item.id === materialId)
    || importedBanks().reduce<QuestionMaterial[]>((items, bank) => items.concat(bank.materials), []).find((item) => item.id === materialId);
}

function getAnswerKey(questionId: string): AnswerKey | undefined {
  return ANSWER_KEYS[questionId]
    || importedBanks().reduce<AnswerKey[]>((items, bank) => items.concat(bank.answerKeys), []).find((item) => item.questionId === questionId);
}

function getWord(wordId?: string) {
  return WORDS.find((item) => item.id === wordId);
}

function getBook(bookId?: string) {
  return WORD_BOOKS.find((item) => item.id === bookId);
}

function requireSession(state: AppState, sessionId: string): PracticeSession {
  const session = state.sessions[sessionId];
  if (!session) fail('练习已失效，请重新开始');
  return session;
}

function requireQuestion(questionId: string) {
  const question = getQuestion(questionId);
  if (!question) fail('题目不存在或已下架');
  return question;
}

function subjectStats(state: AppState, subjectId: string, sourceRecords = state.answerRecords) {
  const builtInQuestionIds = new Set(QUESTIONS.filter((item) => item.subjectId === subjectId).map((item) => item.id));
  const records = sourceRecords.filter((item) => item.subjectId === subjectId && builtInQuestionIds.has(item.questionId));
  const correct = records.filter((item) => item.correct).length;
  const totalQuestions = builtInQuestionIds.size;
  const answeredQuestionIds = new Set(records.map((item) => item.questionId));
  return {
    total: totalQuestions,
    answered: answeredQuestionIds.size,
    attempts: records.length,
    correct,
    accuracy: percent(correct, records.length),
    progress: percent(answeredQuestionIds.size, totalQuestions),
  };
}

function scopeQuestionIds(state: AppState, config: PracticeConfig): string[] {
  const importedBank = getImportedBank(config.questionBankId);
  let questions = config.questionBankId
    ? [...(importedBank?.questions || [])]
    : config.practiceType === 'WRONG' || config.practiceType === 'FAVORITE'
      ? allQuestions()
      : [...QUESTIONS];
  if (config.examId) {
    const subjectIds = new Set(SUBJECTS.filter((item) => item.examId === config.examId).map((item) => item.id));
    questions = questions.filter((item) => subjectIds.has(item.subjectId));
  }
  if (config.subjectId) questions = questions.filter((item) => item.subjectId === config.subjectId);
  if (config.chapterIds?.length) {
    const chapterIds = new Set(config.chapterIds);
    questions = questions.filter((item) => chapterIds.has(item.chapterId));
  }
  if (config.knowledgePointIds?.length) {
    const ids = new Set(config.knowledgePointIds);
    questions = questions.filter((item) => item.knowledgePointIds.some((id) => ids.has(id)));
  }
  if (config.difficulty?.length) {
    const difficulty = new Set(config.difficulty);
    questions = questions.filter((item) => difficulty.has(item.difficulty));
  }
  if (config.practiceType === 'WRONG') {
    const wrongIds = new Set(
      Object.values(state.wrongQuestions)
        .filter((item) => item.masteryStatus === 'UNMASTERED')
        .map((item) => item.questionId),
    );
    questions = questions.filter((item) => wrongIds.has(item.id));
  }
  if (config.practiceType === 'FAVORITE') {
    const favoriteIds = new Set(state.favoriteQuestionIds);
    questions = questions.filter((item) => favoriteIds.has(item.id));
  }
  questions.sort((left, right) => left.sort - right.sort);
  if (config.practiceType === 'RANDOM') {
    questions = shuffled(questions);
  } else {
    const lastAnsweredAt = new Map<string, number>();
    state.answerRecords.forEach((record) => {
      const answeredAt = new Date(record.answeredAt).getTime();
      const previous = lastAnsweredAt.get(record.questionId) || 0;
      if (answeredAt > previous) lastAnsweredAt.set(record.questionId, answeredAt);
    });
    questions.sort((left, right) => {
      const recencyDifference = (lastAnsweredAt.get(left.id) || 0) - (lastAnsweredAt.get(right.id) || 0);
      return recencyDifference || left.sort - right.sort;
    });
  }
  return questions.map((item) => item.id);
}

function questionView(state: AppState, questionId: string): PracticeQuestionVO {
  const question = requireQuestion(questionId);
  const material = getMaterial(question.materialId);
  return {
    ...question,
    typeLabel: questionTypeLabel(question.type),
    originLabel: question.bankKind === 'CIVIL_REAL' ? '考公真题' : question.bankId ? '导入题' : '练习题',
    material,
    knowledgePoints: question.knowledgePointIds.map((id) => getKnowledgePoint(id)).filter(Boolean) as any,
    favorite: state.favoriteQuestionIds.includes(question.id),
  };
}

function sessionCounts(session: PracticeSession) {
  const answers = Object.values(session.answers);
  const correct = answers.filter((item) => item.result.correct).length;
  return {
    total: session.questionIds.length,
    answered: answers.length,
    correct,
    wrong: answers.length - correct,
    unanswered: Math.max(0, session.questionIds.length - answers.length),
    accuracy: percent(correct, answers.length),
    durationSeconds: answers.reduce((sum, item) => sum + (item.durationSeconds || 0), 0),
  };
}

function sessionCard(session: PracticeSession) {
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

function progressForBook(state: AppState, bookId: string) {
  const book = getBook(bookId);
  if (!book) return { total: 0, learned: 0, mastered: 0, due: 0, progress: 0 };
  const learned = book.wordIds.filter((id) => Boolean(state.wordLearning[id])).length;
  const mastered = book.wordIds.filter((id) => state.wordLearning[id]?.masteryLevel === 3).length;
  const now = Date.now();
  const due = book.wordIds.filter((id) => {
    const record = state.wordLearning[id];
    return Boolean(record && new Date(record.nextReviewAt).getTime() <= now);
  }).length;
  return { total: book.wordIds.length, learned, mastered, due, progress: percent(learned, book.wordIds.length) };
}

function currentBook(state: AppState) {
  return getBook(state.currentBookId) || WORD_BOOKS[0];
}

function aggregateDaily(state: AppState, period: StatisticsPeriod) {
  const start = periodStart(period).getTime();
  const records = Object.values(state.dailyStats).filter((item) => new Date(`${item.date}T00:00:00`).getTime() >= start);
  return records.reduce(
    (sum, item) => ({
      studyDurationSeconds: sum.studyDurationSeconds + item.studyDurationSeconds,
      newWordCount: sum.newWordCount + item.newWordCount,
      reviewWordCount: sum.reviewWordCount + item.reviewWordCount,
      questionCount: sum.questionCount + item.questionCount,
      correctCount: sum.correctCount + item.correctCount,
      wrongCount: sum.wrongCount + item.wrongCount,
      finishedSessionCount: sum.finishedSessionCount + item.finishedSessionCount,
    }),
    { studyDurationSeconds: 0, newWordCount: 0, reviewWordCount: 0, questionCount: 0, correctCount: 0, wrongCount: 0, finishedSessionCount: 0 },
  );
}

function consecutiveDays(state: AppState): number {
  const active = new Set(
    Object.values(state.dailyStats)
      .filter((item) => item.questionCount + item.newWordCount + item.reviewWordCount > 0)
      .map((item) => item.date),
  );
  let cursor = new Date();
  if (!active.has(dateKey(cursor))) cursor = addDays(cursor, -1);
  let streak = 0;
  while (active.has(dateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function subjectAnalysis(state: AppState, sourceRecords = state.answerRecords) {
  return SUBJECTS.map((subject) => ({
    ...subject,
    ...subjectStats(state, subject.id, sourceRecords),
  })).sort((left, right) => right.attempts - left.attempts || right.accuracy - left.accuracy);
}

function weakPoints(state: AppState, sourceRecords = state.answerRecords) {
  const buckets: Record<string, { total: number; correct: number }> = {};
  sourceRecords.forEach((record) => {
    record.knowledgePointIds.forEach((knowledgePointId) => {
      if (!buckets[knowledgePointId]) buckets[knowledgePointId] = { total: 0, correct: 0 };
      buckets[knowledgePointId].total += 1;
      if (record.correct) buckets[knowledgePointId].correct += 1;
    });
  });
  return Object.entries(buckets)
    .map(([knowledgePointId, value]) => {
      const knowledge = getKnowledgePoint(knowledgePointId)!;
      const chapter = getChapter(knowledge.chapterId)!;
      const subject = getSubject(chapter.subjectId)!;
      return {
        knowledgePointId,
        knowledgePointName: knowledge.name,
        chapterId: chapter.id,
        chapterName: chapter.name,
        subjectId: subject.id,
        subjectName: subject.name,
        total: value.total,
        correct: value.correct,
        accuracy: percent(value.correct, value.total),
      };
    })
    .sort((left, right) => left.accuracy - right.accuracy || right.total - left.total)
    .slice(0, 6);
}

function historyItems(state: AppState) {
  return Object.values(state.sessions)
    .filter((session) => Object.keys(session.answers).length > 0)
    .sort((left, right) => new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime())
    .map((session) => {
      const counts = sessionCounts(session);
      const subject = getSubject(session.config.subjectId);
      const bank = getImportedBank(session.config.questionBankId);
      return {
        id: session.id,
        title: bank?.title || subject?.name || getExam(session.config.examId)?.shortName || '综合练习',
        mode: modeLabel(session.config.practiceType),
        status: session.status,
        date: friendlyDate(session.startedAt),
        time: timeLabel(session.startedAt),
        ...counts,
        durationLabel: durationLabel(counts.durationSeconds),
      };
    });
}

function wordView(state: AppState, wordId: string) {
  const word = getWord(wordId);
  if (!word) fail('单词不存在');
  const learning = state.wordLearning[wordId];
  return {
    ...word,
    favorite: state.favoriteWordIds.includes(wordId),
    masteryLevel: learning?.masteryLevel,
    masteryLabel: learning ? ratingLabel(learning.masteryLevel) : '未学习',
    nextReviewAt: learning?.nextReviewAt,
  };
}

export const api = {
  async initialize() {
    return response(() => initializeState(), 0);
  },

  async login(nickname = '学习者') {
    return response(() => {
      const state = loadState();
      if (!state.user) {
        state.user = {
          id: 'user-local-001',
          nickname: nickname.trim() || '学习者',
          avatarUrl: '',
          registeredAt: new Date().toISOString(),
        };
      }
      saveState(state);
      return state.user;
    }, 180);
  },

  async logout() {
    return response(() => {
      const state = loadState();
      state.user = null;
      saveState(state);
      return true;
    });
  },

  async getProfile() {
    return response(() => loadState().user, 0);
  },

  async updateProfile(input: { nickname?: string; avatarUrl?: string }) {
    return response(() => {
      const state = loadState();
      if (!state.user) fail('请先登录');
      state.user = { ...state.user!, ...input };
      saveState(state);
      return state.user;
    });
  },

  async getSettings() {
    return response(() => loadState().settings);
  },

  async updateSettings(settings: Partial<UserSettings>) {
    return response(() => {
      const state = loadState();
      state.settings = { ...state.settings, ...settings };
      saveState(state);
      return state.settings;
    });
  },

  async resetDemo() {
    return response(() => resetState());
  },

  async getHome() {
    return response(() => {
      const state = loadState();
      const today = ensureDaily(state);
      saveState(state);
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
        questionProgress: percent(today.questionCount, state.settings.dailyQuestionTarget),
        wordProgress: percent(today.newWordCount + today.reviewWordCount, state.settings.dailyWordTarget),
        studyProgress: percent(Math.ceil(today.studyDurationSeconds / 60), state.settings.dailyStudyMinutes),
        currentBook: { ...book, ...bookProgress },
        unfinished: unfinished
          ? {
              sessionId: unfinished.id,
              title: getImportedBank(unfinished.config.questionBankId)?.title || getSubject(unfinished.config.subjectId)?.name || '综合练习',
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
      const state = loadState();
      const today = ensureDaily(state);
      const trend = Array.from({ length: 7 }, (_, offset) => {
        const date = addDays(new Date(), offset - 6);
        const item = state.dailyStats[dateKey(date)];
        const total = item ? item.questionCount + item.newWordCount + item.reviewWordCount : 0;
        return { date: dateKey(date), label: weekdayLabel(date), total, height: Math.max(6, Math.min(100, total * 5)) };
      });
      saveState(state);
      return {
        today,
        todayStudyMinutes: Math.ceil(today.studyDurationSeconds / 60),
        questionTarget: state.settings.dailyQuestionTarget,
        wordTarget: state.settings.dailyWordTarget,
        studyTarget: state.settings.dailyStudyMinutes,
        questionProgress: percent(today.questionCount, state.settings.dailyQuestionTarget),
        wordProgress: percent(today.newWordCount + today.reviewWordCount, state.settings.dailyWordTarget),
        studyProgress: percent(Math.ceil(today.studyDurationSeconds / 60), state.settings.dailyStudyMinutes),
        trend,
        recent: historyItems(state).slice(0, 3),
        weakPoints: weakPoints(state).slice(0, 3),
      };
    });
  },

  async listExams() {
    return response(() => {
      const state = loadState();
      return EXAMS.map((exam) => {
        const subjects = SUBJECTS.filter((item) => item.examId === exam.id);
        const stats = subjects.map((item) => subjectStats(state, item.id));
        const attempts = stats.reduce((sum, item) => sum + item.attempts, 0);
        const correct = stats.reduce((sum, item) => sum + item.correct, 0);
        return { ...exam, subjectCount: subjects.length, questionCount: stats.reduce((sum, item) => sum + item.total, 0), accuracy: percent(correct, attempts) };
      });
    });
  },

  async getImportedQuestionOverview() {
    return response(() => {
      const banks = importedBanks();
      const summarize = (kind: QuestionBankKind) => {
        const items = banks.filter((item) => item.kind === kind);
        return {
          bankCount: items.length,
          questionCount: items.reduce((sum, item) => sum + item.questions.length, 0),
        };
      };
      return { civilReal: summarize('CIVIL_REAL'), other: summarize('OTHER') };
    }, 20);
  },

  async listImportedQuestionBanks(kind?: QuestionBankKind) {
    return response(() => {
      const state = loadState();
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
            importedDate: friendlyDate(bank.importedAt),
            questionCount: bank.questions.length,
            answered,
            accuracy: percent(correct, records.length),
          };
        })
        .sort((left, right) => new Date(right.importedAt).getTime() - new Date(left.importedAt).getTime());
    }, 20);
  },

  async importQuestionBank(input: NormalizedQuestionBankImport, kind: QuestionBankKind, fileName: string) {
    return response(() => {
      const existing = importedBanks();
      const sameBank = existing.find((item) =>
        item.kind === kind
        && item.title === input.title
        && item.year === input.year
        && item.questions.length === input.questions.length
        && item.questions.slice(0, 3).map((question) => question.stem).join('|') === input.questions.slice(0, 3).map((question) => question.stem).join('|'),
      );
      if (sameBank) fail('这套题已经导入过了');

      const bankId = uniqueId('bank');
      const materials: QuestionMaterial[] = [];
      const questions: Question[] = [];
      const answerKeys: AnswerKey[] = [];

      input.questions.forEach((item, index) => {
        const questionId = `${bankId}-q-${index + 1}`;
        let materialId: string | undefined;
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

      const bank: ImportedQuestionBank = {
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
      saveImportedQuestionBank(bank);
      return { id: bank.id, title: bank.title, kind: bank.kind, questionCount: bank.questions.length };
    }, 80);
  },

  async getExamDetail(examId: string) {
    return response(() => {
      const state = loadState();
      const exam = getExam(examId);
      if (!exam) fail('考试分类不存在');
      const subjects = SUBJECTS.filter((item) => item.examId === examId).map((item) => ({ ...item, ...subjectStats(state, item.id) }));
      return { exam, subjects };
    });
  },

  async getSubjectDetail(subjectId: string) {
    return response(() => {
      const state = loadState();
      const subject = getSubject(subjectId);
      if (!subject) fail('科目不存在');
      const exam = getExam(subject!.examId);
      const chapters = CHAPTERS.filter((item) => item.subjectId === subjectId)
        .sort((left, right) => left.sort - right.sort)
        .map((chapter) => {
          const questionIds = QUESTIONS.filter((item) => item.chapterId === chapter.id).map((item) => item.id);
          const records = state.answerRecords.filter((item) => questionIds.includes(item.questionId));
          const correct = records.filter((item) => item.correct).length;
          return { ...chapter, total: questionIds.length, attempts: records.length, accuracy: percent(correct, records.length) };
        });
      return { exam, subject, stats: subjectStats(state, subjectId), chapters };
    });
  },

  async getChapterDetail(chapterId: string) {
    return response(() => {
      const state = loadState();
      const chapter = getChapter(chapterId);
      if (!chapter) fail('章节不存在');
      const subject = getSubject(chapter!.subjectId)!;
      const knowledgePoints = KNOWLEDGE_POINTS.filter((item) => item.chapterId === chapterId).map((point) => {
        const questionIds = QUESTIONS.filter((item) => item.knowledgePointIds.includes(point.id)).map((item) => item.id);
        const records = state.answerRecords.filter((item) => questionIds.includes(item.questionId));
        const correct = records.filter((item) => item.correct).length;
        return { ...point, total: questionIds.length, attempts: records.length, accuracy: percent(correct, records.length) };
      });
      return { chapter, subject, exam: getExam(subject.examId), knowledgePoints };
    });
  },

  async getAvailableQuestionCount(config: PracticeConfig) {
    return response(() => scopeQuestionIds(loadState(), config).length, 20);
  },

  async createSession(config: PracticeConfig) {
    return response(() => {
      const state = loadState();
      const available = scopeQuestionIds(state, config);
      if (!available.length) fail(config.practiceType === 'WRONG' ? '暂无未掌握错题' : config.practiceType === 'FAVORITE' ? '还没有收藏题目' : '当前范围暂无可用题目');
      const questionIds = available.slice(0, Math.max(1, Math.min(config.count || available.length, available.length)));
      const now = new Date().toISOString();
      const session: PracticeSession = {
        id: uniqueId('session'),
        userId: state.user?.id || 'guest',
        config: { ...config, count: questionIds.length },
        questionIds,
        currentIndex: 0,
        answers: {},
        status: 'IN_PROGRESS',
        startedAt: now,
        lastActiveAt: now,
      };
      state.sessions[session.id] = session;
      saveState(state);
      return { sessionId: session.id, total: questionIds.length };
    }, 160);
  },

  async getSession(sessionId: string) {
    return response(() => {
      const state = loadState();
      const session = requireSession(state, sessionId);
      const subject = getSubject(session.config.subjectId);
      return { session, subject, bank: getImportedBank(session.config.questionBankId), counts: sessionCounts(session), card: sessionCard(session) };
    });
  },

  async getPracticeQuestion(sessionId: string, index?: number) {
    return response(() => {
      const state = loadState();
      const session = requireSession(state, sessionId);
      const safeIndex = Math.max(0, Math.min(typeof index === 'number' ? index : session.currentIndex, session.questionIds.length - 1));
      session.currentIndex = safeIndex;
      session.lastActiveAt = new Date().toISOString();
      const questionId = session.questionIds[safeIndex];
      const answer = session.answers[questionId];
      saveState(state);
      return {
        sessionId,
        index: safeIndex,
        number: safeIndex + 1,
        total: session.questionIds.length,
        question: questionView(state, questionId),
        selectedKeys: answer?.userKeys || [],
        submitted: Boolean(answer),
        result: answer?.result || null,
        counts: sessionCounts(session),
      };
    }, 45);
  },

  async setSessionIndex(sessionId: string, index: number) {
    return response(() => {
      const state = loadState();
      const session = requireSession(state, sessionId);
      session.currentIndex = Math.max(0, Math.min(index, session.questionIds.length - 1));
      session.lastActiveAt = new Date().toISOString();
      saveState(state);
      return session.currentIndex;
    }, 0);
  },

  async submitAnswer(sessionId: string, questionId: string, selectedKeys: string[], durationSeconds = 0) {
    return response(() => {
      const state = loadState();
      const session = requireSession(state, sessionId);
      if (!session.questionIds.includes(questionId)) fail('题目不属于本次练习');
      if (session.answers[questionId]) return session.answers[questionId].result;
      const keys = normalizeKeys(selectedKeys);
      if (!keys.length) fail('请先选择答案');
      const question = requireQuestion(questionId);
      const optionKeys = new Set(question.options.map((item) => item.key));
      if (keys.some((key) => !optionKeys.has(key))) fail('答案选项无效');
      if (question.type !== 'MULTIPLE' && keys.length !== 1) fail('该题只能选择一个答案');
      const answerKey = getAnswerKey(questionId);
      if (!answerKey) fail('题目答案配置缺失');
      const correct = answersEqual(keys, answerKey.correctKeys);
      const now = new Date().toISOString();
      const result = {
        correct,
        userKeys: keys,
        correctKeys: answerKey.correctKeys,
        analysis: answerKey.analysis,
        knowledgePoints: question.knowledgePointIds.map((id) => getKnowledgePoint(id)?.name).filter(Boolean) as string[],
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
        id: uniqueId('answer'),
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
      } else if (session.config.practiceType === 'WRONG' && existingWrong) {
        const streak = existingWrong.correctStreak + 1;
        state.wrongQuestions[questionId] = {
          ...existingWrong,
          correctStreak: streak,
          masteryStatus: streak >= 3 ? 'MASTERED' : existingWrong.masteryStatus,
          masteredAt: streak >= 3 ? now : existingWrong.masteredAt,
        };
      }

      const daily = ensureDaily(state);
      daily.questionCount += 1;
      daily.studyDurationSeconds += Math.max(5, Math.round(durationSeconds || 0));
      if (correct) daily.correctCount += 1;
      else daily.wrongCount += 1;
      saveState(state);
      return result;
    }, 220);
  },

  async finishSession(sessionId: string) {
    return response(() => {
      const state = loadState();
      const session = requireSession(state, sessionId);
      if (!Object.keys(session.answers).length) fail('至少完成一道题后再结束练习');
      if (session.status !== 'FINISHED') {
        session.status = 'FINISHED';
        session.finishedAt = new Date().toISOString();
        ensureDaily(state).finishedSessionCount += 1;
        saveState(state);
      }
      return sessionCounts(session);
    });
  },

  async abandonSession(sessionId: string) {
    return response(() => {
      const state = loadState();
      const session = requireSession(state, sessionId);
      session.status = 'ABANDONED';
      session.lastActiveAt = new Date().toISOString();
      saveState(state);
      return true;
    });
  },

  async getSessionResult(sessionId: string) {
    return response(() => {
      const state = loadState();
      const session = requireSession(state, sessionId);
      const counts = sessionCounts(session);
      const knowledgeBuckets: Record<string, { total: number; correct: number }> = {};
      Object.values(session.answers).forEach((answer) => {
        const question = requireQuestion(answer.questionId);
        question.knowledgePointIds.forEach((id) => {
          if (!knowledgeBuckets[id]) knowledgeBuckets[id] = { total: 0, correct: 0 };
          knowledgeBuckets[id].total += 1;
          if (answer.result.correct) knowledgeBuckets[id].correct += 1;
        });
      });
      const knowledgeStats = Object.entries(knowledgeBuckets)
        .map(([id, item]) => ({ id, name: getKnowledgePoint(id)?.name || '知识点', ...item, accuracy: percent(item.correct, item.total) }))
        .sort((left, right) => left.accuracy - right.accuracy);
      return {
        sessionId,
        title: getImportedBank(session.config.questionBankId)?.title || getSubject(session.config.subjectId)?.name || getExam(session.config.examId)?.shortName || '本次练习',
        mode: modeLabel(session.config.practiceType),
        ...counts,
        durationLabel: durationLabel(counts.durationSeconds),
        knowledgeStats,
        card: sessionCard(session),
      };
    });
  },

  async toggleFavoriteQuestion(questionId: string) {
    return response(() => {
      requireQuestion(questionId);
      const state = loadState();
      const exists = state.favoriteQuestionIds.includes(questionId);
      state.favoriteQuestionIds = exists ? state.favoriteQuestionIds.filter((id) => id !== questionId) : [questionId, ...state.favoriteQuestionIds];
      saveState(state);
      return !exists;
    }, 60);
  },

  async listWrongQuestions(filter: { examId?: string; masteryStatus?: string } = {}) {
    return response(() => {
      const state = loadState();
      const subjectIds = filter.examId ? new Set(SUBJECTS.filter((item) => item.examId === filter.examId).map((item) => item.id)) : null;
      return Object.values(state.wrongQuestions)
        .filter((record) => !filter.masteryStatus || record.masteryStatus === filter.masteryStatus)
        .map((record) => ({ record, question: getQuestion(record.questionId) }))
        .filter((item) => item.question && (!subjectIds || subjectIds.has(item.question.subjectId)))
        .sort((left, right) => new Date(right.record.lastWrongAt).getTime() - new Date(left.record.lastWrongAt).getTime())
        .map((item) => ({
          ...item.record,
          questionId: item.question!.id,
          stem: item.question!.stem,
          typeLabel: questionTypeLabel(item.question!.type),
          originLabel: item.question!.bankKind === 'CIVIL_REAL' ? '考公真题' : item.question!.bankId ? '导入题' : '练习题',
          subject: getSubject(item.question!.subjectId)?.name,
          chapter: getChapter(item.question!.chapterId)?.name,
          lastWrongDate: friendlyDate(item.record.lastWrongAt),
        }));
    });
  },

  async setWrongMastery(questionId: string, mastered: boolean) {
    return response(() => {
      const state = loadState();
      const record = state.wrongQuestions[questionId];
      if (!record) fail('错题记录不存在');
      record.masteryStatus = mastered ? 'MASTERED' : 'UNMASTERED';
      record.masteredAt = mastered ? new Date().toISOString() : undefined;
      if (!mastered) record.correctStreak = 0;
      saveState(state);
      return record;
    });
  },

  async removeWrongQuestion(questionId: string) {
    return response(() => {
      const state = loadState();
      delete state.wrongQuestions[questionId];
      saveState(state);
      return true;
    });
  },

  async listFavoriteQuestions(filter: { examId?: string } = {}) {
    return response(() => {
      const state = loadState();
      const subjectIds = filter.examId ? new Set(SUBJECTS.filter((item) => item.examId === filter.examId).map((item) => item.id)) : null;
      return state.favoriteQuestionIds
        .map((id) => getQuestion(id))
        .filter((item) => item && (!subjectIds || subjectIds.has(item.subjectId)))
        .map((question) => ({
          questionId: question!.id,
          stem: question!.stem,
          typeLabel: questionTypeLabel(question!.type),
          originLabel: question!.bankKind === 'CIVIL_REAL' ? '考公真题' : question!.bankId ? '导入题' : '练习题',
          subject: getSubject(question!.subjectId)?.name,
          chapter: getChapter(question!.chapterId)?.name,
        }));
    });
  },

  async listHistory() {
    return response(() => historyItems(loadState()));
  },

  async getHistoryDetail(sessionId: string) {
    return response(() => {
      const state = loadState();
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
          correct: answer?.result.correct,
          userAnswer: answer?.userKeys.join('、') || '未作答',
          correctAnswer: answer?.result.correctKeys.join('、') || '—',
        };
      });
      return {
        title: getImportedBank(session.config.questionBankId)?.title || getSubject(session.config.subjectId)?.name || '综合练习',
        mode: modeLabel(session.config.practiceType),
        date: `${friendlyDate(session.startedAt)} ${timeLabel(session.startedAt)}`,
        ...counts,
        durationLabel: durationLabel(counts.durationSeconds),
        items,
      };
    });
  },

  async listWordBooks() {
    return response(() => {
      const state = loadState();
      return WORD_BOOKS.map((book) => ({
        ...book,
        selected: state.selectedBookIds.includes(book.id),
        current: state.currentBookId === book.id,
        ...progressForBook(state, book.id),
      }));
    });
  },

  async getWordBookDetail(bookId: string) {
    return response(() => {
      const state = loadState();
      const book = getBook(bookId);
      if (!book) fail('词书不存在');
      return { ...book, selected: state.selectedBookIds.includes(bookId), current: state.currentBookId === bookId, ...progressForBook(state, bookId) };
    });
  },

  async selectWordBook(bookId: string) {
    return response(() => {
      const state = loadState();
      const book = getBook(bookId);
      if (!book) fail('词书不存在');
      if (!state.selectedBookIds.includes(bookId)) state.selectedBookIds.push(bookId);
      state.currentBookId = bookId;
      saveState(state);
      return book;
    });
  },

  async getWordHome() {
    return response(() => {
      const state = loadState();
      const book = currentBook(state);
      const progress = progressForBook(state, book.id);
      const today = ensureDaily(state);
      saveState(state);
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

  async getWordQueue(mode: WordQueueMode) {
    return response(() => {
      const state = loadState();
      const book = currentBook(state);
      const now = Date.now();
      let ids = [...book.wordIds];
      if (mode === 'NEW') ids = ids.filter((id) => !state.wordLearning[id]);
      if (mode === 'REVIEW') ids = ids.filter((id) => state.wordLearning[id] && new Date(state.wordLearning[id].nextReviewAt).getTime() <= now);
      if (mode === 'FAVORITE') ids = ids.filter((id) => state.favoriteWordIds.includes(id));
      const limit = mode === 'NEW' ? state.settings.dailyWordTarget : Math.max(20, state.settings.dailyWordTarget);
      return { mode, book, words: ids.slice(0, limit).map((id) => wordView(state, id)) };
    });
  },

  async rateWord(wordId: string, rating: WordRating, mode: WordQueueMode, durationSeconds = 0) {
    return response(() => {
      const state = loadState();
      const word = getWord(wordId);
      if (!word) fail('单词不存在');
      const now = new Date();
      const existing = state.wordLearning[wordId];
      const wasNew = !existing;
      const nextReview = rating === 0 ? addMinutes(now, 10) : addDays(now, rating === 1 ? 1 : rating === 2 ? 3 : 7);
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
        id: uniqueId('word-log'),
        wordId,
        wordBookId: currentBook(state).id,
        actionType: mode,
        rating,
        durationSeconds: Math.max(1, Math.round(durationSeconds || 0)),
        learnedAt: now.toISOString(),
        nextReviewAt: nextReview.toISOString(),
      });
      const daily = ensureDaily(state);
      if (wasNew && mode === 'NEW') daily.newWordCount += 1;
      else daily.reviewWordCount += 1;
      daily.studyDurationSeconds += Math.max(3, Math.round(durationSeconds || 0));
      saveState(state);
      return { nextReviewAt: nextReview.toISOString(), nextReviewLabel: rating === 0 ? '10 分钟后' : rating === 1 ? '1 天后' : rating === 2 ? '3 天后' : '7 天后' };
    }, 130);
  },

  async toggleFavoriteWord(wordId: string) {
    return response(() => {
      if (!getWord(wordId)) fail('单词不存在');
      const state = loadState();
      const exists = state.favoriteWordIds.includes(wordId);
      state.favoriteWordIds = exists ? state.favoriteWordIds.filter((id) => id !== wordId) : [wordId, ...state.favoriteWordIds];
      saveState(state);
      return !exists;
    }, 50);
  },

  async listFavoriteWords(query = '', mastery = '') {
    return response(() => {
      const state = loadState();
      const keyword = query.trim().toLowerCase();
      return state.favoriteWordIds
        .map((id) => wordView(state, id))
        .filter((item) => !keyword || item.spelling.toLowerCase().includes(keyword) || item.meaning.includes(keyword))
        .filter((item) => mastery === '' || String(item.masteryLevel ?? '') === mastery);
    });
  },

  async getWordProgress() {
    return response(() => {
      const state = loadState();
      const book = currentBook(state);
      const progress = progressForBook(state, book.id);
      const levels = [0, 1, 2, 3].map((level) => {
        const count = book.wordIds.filter((id) => state.wordLearning[id]?.masteryLevel === level).length;
        return { level, label: ratingLabel(level), count, percentage: percent(count, progress.total) };
      });
      const today = ensureDaily(state);
      saveState(state);
      return { book, ...progress, levels, todayNew: today.newWordCount, todayReview: today.reviewWordCount };
    });
  },

  async createWordTests() {
    return response(() => {
      const state = loadState();
      const book = currentBook(state);
      const candidates = shuffled(book.wordIds.map((id) => getWord(id)!).filter(Boolean)).slice(0, Math.min(5, book.wordIds.length));
      return candidates.map((word) => {
        const distractors = shuffled(WORDS.filter((item) => item.id !== word.id)).slice(0, 3);
        const options = shuffled([word, ...distractors]).map((item, index) => ({ key: ['A', 'B', 'C', 'D'][index], content: item.meaning, wordId: item.id }));
        const id = uniqueId('word-test');
        wordTestCache[id] = { correctKey: options.find((item) => item.wordId === word.id)!.key, wordId: word.id };
        return { id, prompt: word.spelling, phonetic: word.ukPhonetic, options: options.map(({ key, content }) => ({ key, content })) };
      });
    });
  },

  async submitWordTest(testId: string, selectedKey: string) {
    return response(() => {
      const cached = wordTestCache[testId];
      if (!cached) fail('测试已失效，请重新开始');
      return { correct: cached.correctKey === selectedKey, correctKey: cached.correctKey };
    }, 90);
  },

  async getStatistics(period: StatisticsPeriod) {
    return response(() => {
      const state = loadState();
      const daily = aggregateDaily(state, period);
      const start = periodStart(period).getTime();
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
        accuracy: percent(daily.correctCount, daily.questionCount),
        learnedWords,
        masteredWords,
        studyDays: Object.values(state.dailyStats).filter((item) => item.questionCount + item.newWordCount + item.reviewWordCount > 0).length,
        continuousStudyDays: consecutiveDays(state),
        subjects: subjectAnalysis(state, periodRecords),
        weakPoints: weakPoints(state, periodRecords),
      };
    });
  },

  async getCalendar(year: number, month: number) {
    return response(() => {
      const state = loadState();
      const first = new Date(year, month - 1, 1);
      const days = new Date(year, month, 0).getDate();
      const leading = first.getDay() === 0 ? 6 : first.getDay() - 1;
      const cells: any[] = Array.from({ length: leading }, (_, index) => ({ key: `blank-${index}`, blank: true }));
      for (let day = 1; day <= days; day += 1) {
        const date = new Date(year, month - 1, day);
        const key = dateKey(date);
        const record = state.dailyStats[key];
        const count = record ? record.questionCount + record.newWordCount + record.reviewWordCount : 0;
        cells.push({ key, day, date: key, active: count > 0, count, today: key === dateKey() });
      }
      return { year, month, cells, activeDays: cells.filter((item) => item.active).length };
    });
  },

  async getSubjectAnalysis() {
    return response(() => subjectAnalysis(loadState()));
  },

  async getWeakPoints() {
    return response(() => weakPoints(loadState()));
  },
};
