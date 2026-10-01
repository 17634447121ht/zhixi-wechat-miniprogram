"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../../../services/api");
Page({
    data: { loading: true, items: [] },
    async onShow() { this.setData({ items: await api_1.api.getWeakPoints(), loading: false }); },
    practice(event) {
        const item = this.data.items.find((candidate) => candidate.knowledgePointId === event.currentTarget.dataset.id);
        if (!item)
            return;
        wx.navigateTo({ url: `/pkg-question/pages/practice-config/index?mode=SPECIAL&subjectId=${item.subjectId}&chapterIds=${item.chapterId}&knowledgePointIds=${item.knowledgePointId}` });
    },
    goBank() { wx.switchTab({ url: '/pages/question-bank/index' }); },
});
