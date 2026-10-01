"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWordStudyPage = createWordStudyPage;
const api_1 = require("../services/api");
function createWordStudyPage(defaultMode) {
    return {
        data: {
            loading: true,
            mode: defaultMode,
            queue: [],
            index: 0,
            current: null,
            revealed: false,
            submitting: false,
            finished: false,
            emptyTitle: '',
            emptyDescription: '',
        },
        startedAt: 0,
        async onLoad(options) {
            const mode = options.source === 'favorite' ? 'FAVORITE' : defaultMode;
            this.setData({ mode });
            wx.setNavigationBarTitle({ title: mode === 'NEW' ? '学习新词' : mode === 'FAVORITE' ? '生词复习' : '复习单词' });
            await this.loadQueue();
        },
        async loadQueue() {
            try {
                const result = await api_1.api.getWordQueue(this.data.mode);
                const emptyTitle = this.data.mode === 'NEW' ? '今日新词已完成' : this.data.mode === 'FAVORITE' ? '生词本还是空的' : '暂无待复习单词';
                const emptyDescription = this.data.mode === 'NEW' ? '休息一下，或去做一组题。' : this.data.mode === 'FAVORITE' ? '收藏单词后可从这里集中复习。' : '系统会在下次复习时间到达后自动安排。';
                this.setData({ queue: result.words, index: 0, current: result.words[0] || null, loading: false, finished: false, emptyTitle, emptyDescription });
                this.startedAt = Date.now();
            }
            catch (error) {
                this.setData({ loading: false, current: null, emptyTitle: '加载失败', emptyDescription: error.message || '请稍后重试' });
            }
        },
        reveal() { this.setData({ revealed: true }); },
        speak() { wx.showToast({ title: '演示词库暂未配置音频', icon: 'none' }); },
        async favorite() {
            const favorite = await api_1.api.toggleFavoriteWord(this.data.current.id);
            this.setData({ 'current.favorite': favorite });
            wx.showToast({ title: favorite ? '已加入生词本' : '已移出生词本', icon: 'none' });
        },
        async rate(event) {
            if (!this.data.revealed || this.data.submitting)
                return;
            const rating = Number(event.currentTarget.dataset.rating);
            this.setData({ submitting: true });
            try {
                const result = await api_1.api.rateWord(this.data.current.id, rating, this.data.mode, Math.round((Date.now() - this.startedAt) / 1000));
                wx.showToast({ title: `下次复习：${result.nextReviewLabel}`, icon: 'none', duration: 900 });
                setTimeout(() => this.advance(), 450);
            }
            catch (error) {
                wx.showToast({ title: error.message || '保存失败', icon: 'none' });
                this.setData({ submitting: false });
            }
        },
        advance() {
            const nextIndex = this.data.index + 1;
            if (nextIndex >= this.data.queue.length) {
                this.setData({ finished: true, current: null, submitting: false });
                return;
            }
            this.setData({ index: nextIndex, current: this.data.queue[nextIndex], revealed: false, submitting: false });
            this.startedAt = Date.now();
        },
        goHome() { wx.redirectTo({ url: '/pkg-word/pages/home/index' }); },
        goTest() { wx.redirectTo({ url: '/pkg-word/pages/test/index' }); },
        goBookList() { wx.redirectTo({ url: '/pkg-word/pages/book-list/index' }); },
    };
}
