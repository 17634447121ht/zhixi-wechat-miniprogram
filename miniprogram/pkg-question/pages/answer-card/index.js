"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../../../services/api");
Page({
    data: { loading: true, sessionId: '', detail: null, error: '' },
    async onLoad(options) {
        if (!options.sessionId) {
            this.setData({ loading: false, error: '题卡参数已失效' });
            return;
        }
        this.setData({ sessionId: options.sessionId });
    },
    async onShow() {
        if (!this.data.sessionId)
            return;
        try {
            this.setData({ detail: await api_1.api.getSession(this.data.sessionId), loading: false });
        }
        catch (error) {
            this.setData({ loading: false, error: error.message || '题卡加载失败' });
        }
    },
    async jump(event) {
        await api_1.api.setSessionIndex(this.data.sessionId, Number(event.currentTarget.dataset.index));
        wx.navigateBack();
    },
    async finish() {
        const { unanswered } = this.data.detail.counts;
        const confirm = await new Promise((resolve) => wx.showModal({ title: '结束本次练习？', content: unanswered ? `还有 ${unanswered} 道题未作答。` : '全部题目已作答，可以生成练习报告。', confirmText: '查看报告', success: (result) => resolve(result.confirm) }));
        if (!confirm)
            return;
        try {
            await api_1.api.finishSession(this.data.sessionId);
            wx.redirectTo({ url: `/pkg-question/pages/practice-result/index?sessionId=${this.data.sessionId}` });
        }
        catch (error) {
            wx.showToast({ title: error.message || '无法结束', icon: 'none' });
        }
    },
    goBack() { wx.navigateBack(); },
});
