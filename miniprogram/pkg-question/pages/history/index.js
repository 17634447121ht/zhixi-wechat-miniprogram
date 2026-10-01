"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../../../services/api");
Page({
    data: { loading: true, items: [] },
    async onShow() { this.setData({ loading: true }); const items = await api_1.api.listHistory(); this.setData({ items, loading: false }); },
    async onPullDownRefresh() { await this.onShow(); wx.stopPullDownRefresh(); },
    open(event) { wx.navigateTo({ url: `/pkg-question/pages/history-detail/index?sessionId=${event.currentTarget.dataset.id}` }); },
    goBank() { wx.switchTab({ url: '/pages/question-bank/index' }); },
});
