import type { AppState, DailyStudy } from '../types/index';
import { dateKey } from '../utils/date';

const STORAGE_KEY = 'zhixi.app.state.v1';

function createDefaultState(): AppState {
  return {
    version: 1,
    user: null,
    settings: {
      dailyWordTarget: 20,
      dailyQuestionTarget: 20,
      dailyStudyMinutes: 30,
      autoNextQuestion: false,
      showAnalysisAfterAnswer: true,
    },
    selectedBookIds: ['book-postgrad'],
    currentBookId: 'book-postgrad',
    favoriteQuestionIds: [],
    favoriteWordIds: [],
    wrongQuestions: {},
    sessions: {},
    answerRecords: [],
    wordLearning: {},
    wordLogs: [],
    dailyStats: {},
  };
}

export function loadState(): AppState {
  const defaults = createDefaultState();
  try {
    const stored = wx.getStorageSync(STORAGE_KEY) as Partial<AppState>;
    if (!stored || stored.version !== 1) return defaults;
    return {
      ...defaults,
      ...stored,
      settings: { ...defaults.settings, ...(stored.settings || {}) },
      wrongQuestions: stored.wrongQuestions || {},
      sessions: stored.sessions || {},
      answerRecords: stored.answerRecords || [],
      wordLearning: stored.wordLearning || {},
      wordLogs: stored.wordLogs || [],
      dailyStats: stored.dailyStats || {},
    };
  } catch (_error) {
    return defaults;
  }
}

export function saveState(state: AppState): void {
  wx.setStorageSync(STORAGE_KEY, state);
}

export function initializeState(): AppState {
  const state = loadState();
  saveState(state);
  return state;
}

export function resetState(): AppState {
  const state = createDefaultState();
  saveState(state);
  return state;
}

export function ensureDaily(state: AppState, key = dateKey()): DailyStudy {
  if (!state.dailyStats[key]) {
    state.dailyStats[key] = {
      date: key,
      studyDurationSeconds: 0,
      newWordCount: 0,
      reviewWordCount: 0,
      questionCount: 0,
      correctCount: 0,
      wrongCount: 0,
      finishedSessionCount: 0,
    };
  }
  return state.dailyStats[key];
}
