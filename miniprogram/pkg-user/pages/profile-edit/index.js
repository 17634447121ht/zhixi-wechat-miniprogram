"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../../../services/api");
Page({
    data: { loading: true, saving: false, profile: null, nickname: '', avatarUrl: '', initial: '知' },
    async onLoad() {
        const profile = await api_1.api.getProfile();
        if (!profile) {
            wx.redirectTo({ url: '/pages/login/index' });
            return;
        }
        this.setData({ profile, nickname: profile.nickname, avatarUrl: profile.avatarUrl, initial: (profile.nickname || '知').charAt(0), loading: false });
    },
    onNickname(event) { this.setData({ nickname: event.detail.value, initial: (event.detail.value || '知').charAt(0) }); },
    onChooseAvatar(event) { this.setData({ avatarUrl: event.detail.avatarUrl }); },
    async save() {
        if (!this.data.nickname.trim()) {
            wx.showToast({ title: '请输入昵称', icon: 'none' });
            return;
        }
        this.setData({ saving: true });
        try {
            const profile = await api_1.api.updateProfile({ nickname: this.data.nickname.trim(), avatarUrl: this.data.avatarUrl });
            getApp().globalData.user = profile;
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
