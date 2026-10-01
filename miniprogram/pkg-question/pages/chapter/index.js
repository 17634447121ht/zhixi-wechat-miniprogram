"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../../../services/api");
Page({
    data: { loading: true, detail: null, error: '' },
    async onLoad(options) {
        if (!options.subjectId) {
            this.setData({ loading: false, error: '缺少科目参数' });
            return;
        }
        try {
            const detail = await api_1.api.getSubjectDetail(options.subjectId);
            wx.setNavigationBarTitle({ title: `${detail.subject.name} · 章节` });
            this.setData({ detail, loading: false });
        }
        catch (error) {
            this.setData({ loading: false, error: error.message || '加载失败' });
        }
    },
    openKnowledge(event) { wx.navigateTo({ url: `/pkg-question/pages/knowledge/index?chapterId=${event.currentTarget.dataset.id}` }); },
    goBack() { wx.navigateBack(); },
});
