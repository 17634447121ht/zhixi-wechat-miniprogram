"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../../../services/api");
Page({
    data: { loading: true, saving: false, settings: null },
    async onLoad() { this.setData({ settings: await api_1.api.getSettings(), loading: false }); },
    onNumber(event) {
        const key = event.currentTarget.dataset.key;
        const value = Math.max(1, Math.min(500, Number(event.detail.value) || 1));
        this.setData({ [`settings.${key}`]: value });
    },
    onSwitch(event) { this.setData({ [`settings.${event.currentTarget.dataset.key}`]: event.detail.value }); },
    async save() {
        if (this.data.saving)
            return;
        this.setData({ saving: true });
        try {
            await api_1.api.updateSettings(this.data.settings);
            wx.showToast({ title: '已保存', icon: 'success' });
            setTimeout(() => wx.navigateBack(), 250);
        }
        catch (error) {
            wx.showToast({ title: error.message || '保存失败', icon: 'none' });
        }
        finally {
            this.setData({ saving: false });
        }
    },
});
