"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../../services/api");
Page({
    data: { loading: true, dashboard: null },
    async onShow() { await this.load(); },
    async onPullDownRefresh() { await this.load(); wx.stopPullDownRefresh(); },
    async load() {
        try {
            this.setData({ dashboard: await api_1.api.getStudyDashboard(), loading: false });
        }
        catch (error) {
            this.setData({ loading: false });
            wx.showToast({ title: error.message || '加载失败', icon: 'none' });
        }
    },
    goWord() { wx.navigateTo({ url: '/pkg-word/pages/home/index' }); },
    goQuestionBank() { wx.switchTab({ url: '/pages/question-bank/index' }); },
    goStatistics() { wx.navigateTo({ url: '/pkg-user/pages/statistics/index' }); },
    goWeakPoints() { wx.navigateTo({ url: '/pkg-user/pages/weak-points/index' }); },
});
