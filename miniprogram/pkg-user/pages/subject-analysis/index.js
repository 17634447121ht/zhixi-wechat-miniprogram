"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../../../services/api");
Page({
    data: { loading: true, subjects: [] },
    async onLoad() { this.setData({ subjects: await api_1.api.getSubjectAnalysis(), loading: false }); },
    open(event) { wx.navigateTo({ url: `/pkg-question/pages/subject/index?subjectId=${event.currentTarget.dataset.id}` }); },
    goBank() { wx.switchTab({ url: '/pages/question-bank/index' }); },
});
