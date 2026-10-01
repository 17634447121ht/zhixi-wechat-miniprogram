import { api } from '../../../services/api';

Page({
  data: { loading: true, items: [] as any[], filter: 'ALL', filters: [{ value: 'ALL', label: '全部' }, { value: 'exam-civil', label: '考公' }, { value: 'exam-postgrad', label: '考研' }] },
  async onShow() { await this.load(); },
  async onPullDownRefresh() { await this.load(); wx.stopPullDownRefresh(); },
  async load() {
    const options = this.data.filter === 'ALL' ? {} : { examId: this.data.filter };
    this.setData({ loading: true });
    const items = await api.listFavoriteQuestions(options);
    this.setData({ items, loading: false });
  },
  async chooseFilter(event: any) { this.setData({ filter: event.currentTarget.dataset.value }); await this.load(); },
  async remove(event: any) { await api.toggleFavoriteQuestion(event.currentTarget.dataset.id); await this.load(); },
  start() {
    const query = this.data.filter === 'ALL' ? '' : `&examId=${this.data.filter}`;
    wx.navigateTo({ url: `/pkg-question/pages/practice-config/index?mode=FAVORITE${query}` });
  },
  goBank() { wx.switchTab({ url: '/pages/question-bank/index' }); },
});
