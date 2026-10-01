"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../../services/api");
Page({
    data: {
        loading: true,
        exams: [],
        overview: {
            civilReal: { bankCount: 0, questionCount: 0 },
            other: { bankCount: 0, questionCount: 0 },
        },
    },
    async onShow() { await this.load(); },
    async onPullDownRefresh() { await this.load(); wx.stopPullDownRefresh(); },
    async load() {
        try {
            const [exams, overview] = await Promise.all([
                api_1.api.listExams(),
                api_1.api.getImportedQuestionOverview(),
            ]);
            this.setData({ exams, overview, loading: false });
        }
        catch (error) {
            this.setData({ loading: false });
            wx.showToast({ title: error.message || '加载失败', icon: 'none' });
        }
    },
    goImport(event) {
        var _a, _b;
        const kind = (_b = (_a = event === null || event === void 0 ? void 0 : event.currentTarget) === null || _a === void 0 ? void 0 : _a.dataset) === null || _b === void 0 ? void 0 : _b.kind;
        const query = kind ? `?kind=${kind}` : '';
        wx.navigateTo({ url: `/pkg-question/pages/import/index${query}` });
    },
    goWord() { wx.navigateTo({ url: '/pkg-word/pages/home/index' }); },
    goExam(event) { wx.navigateTo({ url: `/pkg-question/pages/exam/index?examId=${event.currentTarget.dataset.id}` }); },
    goWrong() { wx.navigateTo({ url: '/pkg-question/pages/wrong/index' }); },
    goFavorite() { wx.navigateTo({ url: '/pkg-question/pages/favorite/index' }); },
});
