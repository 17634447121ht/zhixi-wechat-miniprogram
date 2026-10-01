import { api } from '../../../services/api';

Page({
  data: {
    loading: true,
    items: [] as any[],
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
    const filter: any = {};
    if (this.data.filter.startsWith('exam-')) filter.examId = this.data.filter;
    if (this.data.filter === 'MASTERED') filter.masteryStatus = 'MASTERED';
    const items = await api.listWrongQuestions(filter);
    this.setData({
      items,
      practiceCount: items.filter((item: any) => item.masteryStatus !== 'MASTERED').length,
      loading: false,
    });
  },
  async chooseFilter(event: any) { this.setData({ filter: event.currentTarget.dataset.value }); await this.load(); },
  async toggleMastery(event: any) {
    const { id, mastered } = event.currentTarget.dataset;
    await api.setWrongMastery(id, !mastered);
    await this.load();
  },
  async remove(event: any) {
    const id = event.currentTarget.dataset.id;
    const confirmed = await new Promise<boolean>((resolve) => wx.showModal({ title: '移出错题本？', content: '答题历史仍会保留。', confirmColor: '#D95B58', success: (result: any) => resolve(result.confirm) }));
    if (!confirmed) return;
    await api.removeWrongQuestion(id);
    await this.load();
  },
  start() {
    const query = this.data.filter.startsWith('exam-') ? `&examId=${this.data.filter}` : '';
    wx.navigateTo({ url: `/pkg-question/pages/practice-config/index?mode=WRONG${query}` });
  },
  goBank() { wx.switchTab({ url: '/pages/question-bank/index' }); },
});
