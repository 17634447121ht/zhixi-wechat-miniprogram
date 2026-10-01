"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../../../services/api");
Page({
    data: { loading: true, detail: null, error: '' },
    async onLoad(options) {
        if (!options.examId) {
            this.setData({ loading: false, error: '缺少考试分类参数' });
            return;
        }
        try {
            const detail = await api_1.api.getExamDetail(options.examId);
            wx.setNavigationBarTitle({ title: detail.exam.shortName });
            this.setData({ detail, loading: false });
        }
        catch (error) {
            this.setData({ loading: false, error: error.message || '加载失败' });
        }
    },
    openSubject(event) { wx.navigateTo({ url: `/pkg-question/pages/subject/index?subjectId=${event.currentTarget.dataset.id}` }); },
    goBack() { wx.navigateBack(); },
});
