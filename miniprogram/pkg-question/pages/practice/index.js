"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../../../services/api");
Page({
    data: {
        loading: true,
        saving: false,
        error: '',
        sessionId: '',
        view: null,
        selectedKeys: [],
        settings: null,
        analysisVisible: false,
        elapsed: 0,
    },
    timer: null,
    questionStartedAt: 0,
    async onLoad(options) {
        if (!options.sessionId) {
            this.setData({ loading: false, error: '练习参数已失效' });
            return;
        }
        this.setData({ sessionId: options.sessionId, settings: await api_1.api.getSettings() });
        await this.loadQuestion();
        this.timer = setInterval(() => this.setData({ elapsed: Math.floor((Date.now() - this.questionStartedAt) / 1000) }), 1000);
    },
    async onShow() {
        if (this.data.sessionId && !this.data.loading)
            await this.loadQuestion();
    },
    onUnload() { if (this.timer)
        clearInterval(this.timer); },
    async loadQuestion(index) {
        var _a;
        try {
            const view = await api_1.api.getPracticeQuestion(this.data.sessionId, index);
            if (view.result) {
                view.result = {
                    ...view.result,
                    userAnswerText: view.result.userKeys.join('、'),
                    correctAnswerText: view.result.correctKeys.join('、'),
                };
            }
            this.questionStartedAt = Date.now();
            this.setData({
                view,
                selectedKeys: view.selectedKeys || [],
                analysisVisible: Boolean(view.submitted && ((_a = this.data.settings) === null || _a === void 0 ? void 0 : _a.showAnalysisAfterAnswer)),
                loading: false,
                error: '',
                elapsed: 0,
            });
            wx.setNavigationBarTitle({ title: `${view.number} / ${view.total}` });
        }
        catch (error) {
            this.setData({ loading: false, error: error.message || '题目加载失败' });
        }
    },
    select(event) {
        if (this.data.view.submitted)
            return;
        const key = event.detail.key;
        const type = this.data.view.question.type;
        const selectedKeys = type === 'MULTIPLE'
            ? (this.data.selectedKeys.includes(key) ? this.data.selectedKeys.filter((item) => item !== key) : [...this.data.selectedKeys, key])
            : [key];
        this.setData({ selectedKeys });
    },
    async submit() {
        if (!this.data.selectedKeys.length) {
            wx.showToast({ title: '请先选择答案', icon: 'none' });
            return;
        }
        if (this.data.saving || this.data.view.submitted)
            return;
        this.setData({ saving: true });
        try {
            const rawResult = await api_1.api.submitAnswer(this.data.sessionId, this.data.view.question.id, this.data.selectedKeys, this.data.elapsed);
            const result = { ...rawResult, userAnswerText: rawResult.userKeys.join('、'), correctAnswerText: rawResult.correctKeys.join('、') };
            this.setData({
                'view.submitted': true,
                'view.result': result,
                'view.counts.answered': this.data.view.counts.answered + 1,
                analysisVisible: Boolean(this.data.settings.showAnalysisAfterAnswer),
                saving: false,
            });
            if (this.data.settings.autoNextQuestion && this.data.view.index < this.data.view.total - 1) {
                setTimeout(() => this.next(), 900);
            }
        }
        catch (error) {
            this.setData({ saving: false });
            wx.showToast({ title: error.message || '提交失败', icon: 'none' });
        }
    },
    async toggleFavorite() {
        const favorite = await api_1.api.toggleFavoriteQuestion(this.data.view.question.id);
        this.setData({ 'view.question.favorite': favorite });
        wx.showToast({ title: favorite ? '已收藏' : '已取消', icon: 'none' });
    },
    async previous() {
        if (this.data.view.index <= 0)
            return;
        await api_1.api.setSessionIndex(this.data.sessionId, this.data.view.index - 1);
        await this.loadQuestion(this.data.view.index - 1);
    },
    async next() {
        if (this.data.view.index >= this.data.view.total - 1) {
            await this.finish();
            return;
        }
        await api_1.api.setSessionIndex(this.data.sessionId, this.data.view.index + 1);
        await this.loadQuestion(this.data.view.index + 1);
    },
    revealAnalysis() { this.setData({ analysisVisible: true }); },
    openCard() { wx.navigateTo({ url: `/pkg-question/pages/answer-card/index?sessionId=${this.data.sessionId}` }); },
    async finish() {
        const unanswered = Math.max(0, this.data.view.counts.total - this.data.view.counts.answered);
        if (unanswered > 0) {
            const confirm = await new Promise((resolve) => wx.showModal({ title: '结束本次练习？', content: `还有 ${unanswered} 道题未作答，仍可结束并查看报告。`, confirmText: '结束练习', success: (result) => resolve(result.confirm) }));
            if (!confirm)
                return;
        }
        try {
            await api_1.api.finishSession(this.data.sessionId);
            wx.redirectTo({ url: `/pkg-question/pages/practice-result/index?sessionId=${this.data.sessionId}` });
        }
        catch (error) {
            wx.showToast({ title: error.message || '暂时无法结束', icon: 'none' });
        }
    },
    goBack() { wx.navigateBack(); },
});
