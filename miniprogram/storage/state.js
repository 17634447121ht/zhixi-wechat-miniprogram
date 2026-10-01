"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadState = loadState;
exports.saveState = saveState;
exports.initializeState = initializeState;
exports.resetState = resetState;
exports.ensureDaily = ensureDaily;
const date_1 = require("../utils/date");
const STORAGE_KEY = 'zhixi.app.state.v1';
function createDefaultState() {
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
function loadState() {
    const defaults = createDefaultState();
    try {
        const stored = wx.getStorageSync(STORAGE_KEY);
        if (!stored || stored.version !== 1)
            return defaults;
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
    }
    catch (_error) {
        return defaults;
    }
}
function saveState(state) {
    wx.setStorageSync(STORAGE_KEY, state);
}
function initializeState() {
    const state = loadState();
    saveState(state);
    return state;
}
function resetState() {
    const state = createDefaultState();
    saveState(state);
    return state;
}
function ensureDaily(state, key = (0, date_1.dateKey)()) {
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
