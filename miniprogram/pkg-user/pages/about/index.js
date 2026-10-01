"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../../config/index");
const api_1 = require("../../../services/api");
Page({
    data: { version: index_1.APP_VERSION },
    showPrivacy() { wx.showModal({ title: '隐私说明', content: '当前演示版仅使用本地存储保存昵称、学习设置、答题和单词记录，不上传微信资料。接入正式服务端后，应在隐私政策中逐项披露数据用途。', showCancel: false }); },
    showAgreement() { wx.showModal({ title: '用户协议', content: '请合法使用题库内容，不传播未经授权的商业题库与解析。正式发布前需补充完整协议文本。', showCancel: false }); },
    feedback() { wx.showToast({ title: '正式版将接入反馈入口', icon: 'none' }); },
    async logout() {
        const confirmed = await new Promise((resolve) => wx.showModal({ title: '退出登录？', content: '学习记录仍会保留在本机。', success: (result) => resolve(result.confirm) }));
        if (!confirmed)
            return;
        await api_1.api.logout();
        getApp().globalData.user = null;
        wx.reLaunch({ url: '/pages/login/index' });
    },
    async reset() {
        const confirmed = await new Promise((resolve) => wx.showModal({ title: '重置演示数据？', content: '本机的答题、错题、收藏、单词记录和设置都会清空，无法恢复。', confirmText: '确认清空', confirmColor: '#D95B58', success: (result) => resolve(result.confirm) }));
        if (!confirmed)
            return;
        await api_1.api.resetDemo();
        getApp().globalData.user = null;
        wx.reLaunch({ url: '/pages/login/index' });
    },
});
