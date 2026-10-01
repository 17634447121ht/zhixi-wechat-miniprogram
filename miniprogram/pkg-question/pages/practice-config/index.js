"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../../../services/api");
const format_1 = require("../../../utils/format");
function decodeQueryValue(value) {
    if (!value)
        return '';
    try {
        return decodeURIComponent(value);
    }
    catch (_error) {
        return value;
    }
}
Page({
    data: {
        loading: true,
        creating: false,
        error: '',
        available: 0,
        scopeLabel: '全部题目',
        modes: [
            { value: 'ORDER', label: '顺序', note: '按题库顺序' },
            { value: 'RANDOM', label: '随机', note: '固定随机题序' },
            { value: 'SPECIAL', label: '专项', note: '按范围筛选' }
        ],
        counts: [],
        difficulties: [1, 2, 3, 4, 5].map((value) => ({ value, selected: false })),
        config: {
            practiceType: 'RANDOM', examId: '', subjectId: '', chapterIds: [], knowledgePointIds: [], difficulty: [], count: 5, questionBankId: '',
        },
    },
    async onLoad(options) {
        const practiceType = (options.mode || 'RANDOM');
        const difficulty = options.difficulty
            ? options.difficulty.split(',').map(Number).filter((value) => value >= 1 && value <= 5)
            : [];
        const requestedCount = Math.max(1, Number(options.count) || 5);
        const config = {
            practiceType,
            examId: options.examId || undefined,
            subjectId: options.subjectId || undefined,
            chapterIds: options.chapterIds ? options.chapterIds.split(',').filter(Boolean) : [],
            knowledgePointIds: options.knowledgePointIds ? options.knowledgePointIds.split(',').filter(Boolean) : [],
            difficulty,
            count: requestedCount,
            questionBankId: options.questionBankId || undefined,
        };
        const scopeLabel = options.bankTitle ? decodeQueryValue(options.bankTitle) : practiceType === 'WRONG' ? '未掌握错题' : practiceType === 'FAVORITE' ? '我的收藏' : config.knowledgePointIds.length ? `${config.knowledgePointIds.length} 个知识点` : config.chapterIds.length ? '当前章节' : config.subjectId ? '当前科目' : '全部题目';
        this.setData({
            config,
            scopeLabel,
            difficulties: this.data.difficulties.map((item) => ({ ...item, selected: difficulty.includes(item.value) })),
        });
        wx.setNavigationBarTitle({ title: `${(0, format_1.modeLabel)(practiceType)}设置` });
        await this.refreshAvailable();
    },
    async refreshAvailable() {
        try {
            const available = await api_1.api.getAvailableQuestionCount(this.data.config);
            const base = [5, 10, 20, 50, this.data.config.count].filter((value) => value > 0);
            const values = available > 0 && available < 5 ? [available, ...base] : base;
            const counts = Array.from(new Set(values)).map((value) => ({ value, disabled: value > available }));
            const valid = counts.filter((item) => !item.disabled).map((item) => item.value);
            const count = valid.includes(this.data.config.count) ? this.data.config.count : (valid[valid.length - 1] || 0);
            this.setData({ available, counts, 'config.count': count, loading: false });
        }
        catch (error) {
            this.setData({ error: error.message || '加载失败', loading: false });
        }
    },
    async chooseMode(event) {
        this.setData({ 'config.practiceType': event.currentTarget.dataset.value });
        await this.refreshAvailable();
    },
    chooseCount(event) {
        const value = Number(event.currentTarget.dataset.value);
        if (value > this.data.available)
            return;
        this.setData({ 'config.count': value });
    },
    async toggleDifficulty(event) {
        const value = Number(event.currentTarget.dataset.value);
        const selected = this.data.config.difficulty.includes(value);
        const difficulty = selected ? this.data.config.difficulty.filter((item) => item !== value) : [...this.data.config.difficulty, value];
        this.setData({
            'config.difficulty': difficulty,
            difficulties: this.data.difficulties.map((item) => ({ ...item, selected: difficulty.includes(item.value) })),
        });
        await this.refreshAvailable();
    },
    async create() {
        if (!this.data.available || this.data.creating)
            return;
        this.setData({ creating: true });
        try {
            const result = await api_1.api.createSession(this.data.config);
            wx.redirectTo({ url: `/pkg-question/pages/practice/index?sessionId=${result.sessionId}` });
        }
        catch (error) {
            wx.showToast({ title: error.message || '创建失败', icon: 'none' });
        }
        finally {
            this.setData({ creating: false });
        }
    },
    goBack() { wx.navigateBack(); },
});
