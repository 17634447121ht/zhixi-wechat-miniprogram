"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../../../services/api");
Page({
    data: {
        loading: true,
        items: [],
        practiceCount: 0,
        filter: 'ALL',
        filters: [
            { value: 'ALL', label: '全部' }, { value: 'exam-civil', label: '考公' }, { value: 'exam-postgrad', label: '考研' }, { value: 'MASTERED', label: '已掌握' },
        ],
    },
    async onShow() { await this.load(); },
    async onPullDownRefresh() { await this.load(); wx.stopPullDownRefresh(); },
    async load() {
        this.setData({ loading: true });
        const filter = {};
        if (this.data.filter.startsWith('exam-'))
            filter.examId = this.data.filter;
        if (this.data.filter === 'MASTERED')
            filter.masteryStatus = 'MASTERED';
        const items = await api_1.api.listWrongQuestions(filter);
        this.setData({
            items,
            practiceCount: items.filter((item) => item.masteryStatus !== 'MASTERED').length,
            loading: false,
        });
    },
    async chooseFilter(event) { this.setData({ filter: event.currentTarget.dataset.value }); await this.load(); },
    async toggleMastery(event) {
        const { id, mastered } = event.currentTarget.dataset;
        await api_1.api.setWrongMastery(id, !mastered);
        await this.load();
    },
    async remove(event) {
        const id = event.currentTarget.dataset.id;
        const confirmed = await new Promise((resolve) => wx.showModal({ title: '移出错题本？', content: '答题历史仍会保留。', confirmColor: '#D95B58', success: (result) => resolve(result.confirm) }));
        if (!confirmed)
            return;
        await api_1.api.removeWrongQuestion(id);
        await this.load();
    },
    start() {
        const query = this.data.filter.startsWith('exam-') ? `&examId=${this.data.filter}` : '';
        wx.navigateTo({ url: `/pkg-question/pages/practice-config/index?mode=WRONG${query}` });
    },
    goBank() { wx.switchTab({ url: '/pages/question-bank/index' }); },
});
