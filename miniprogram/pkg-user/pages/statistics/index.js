"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../../../services/api");
Page({
    data: {
        loading: true,
        period: 'TODAY',
        periods: [{ value: 'TODAY', label: '今日' }, { value: 'WEEK', label: '本周' }, { value: 'MONTH', label: '本月' }, { value: 'TOTAL', label: '总计' }],
        stats: null,
    },
    async onShow() { await this.load(); },
    async onPullDownRefresh() { await this.load(); wx.stopPullDownRefresh(); },
    async load() { this.setData({ loading: true }); const stats = await api_1.api.getStatistics(this.data.period); this.setData({ stats, loading: false }); },
    async choosePeriod(event) { this.setData({ period: event.currentTarget.dataset.value }); await this.load(); },
    goCalendar() { wx.navigateTo({ url: '/pkg-user/pages/calendar/index' }); },
    goSubjects() { wx.navigateTo({ url: '/pkg-user/pages/subject-analysis/index' }); },
    goWeak() { wx.navigateTo({ url: '/pkg-user/pages/weak-points/index' }); },
    goBank() { wx.switchTab({ url: '/pages/question-bank/index' }); },
});
