"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../../../services/api");
Page({
    data: { loading: true, detail: null, error: '' },
    async onLoad(options) {
        if (!options.sessionId) {
            this.setData({ loading: false, error: '记录参数已失效' });
            return;
        }
        try {
            this.setData({ detail: await api_1.api.getHistoryDetail(options.sessionId), loading: false });
        }
        catch (error) {
            this.setData({ loading: false, error: error.message || '记录加载失败' });
        }
    },
    goBack() { wx.navigateBack(); },
});
