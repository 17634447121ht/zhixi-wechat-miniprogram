"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../../../services/api");
Page({
    data: { loading: true, progress: null },
    async onShow() { this.setData({ progress: await api_1.api.getWordProgress(), loading: false }); },
    goStudy() { wx.navigateTo({ url: '/pkg-word/pages/study/index' }); },
    goReview() { wx.navigateTo({ url: '/pkg-word/pages/review/index' }); },
});
