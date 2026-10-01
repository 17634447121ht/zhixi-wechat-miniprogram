import { api } from '../../services/api';

Page({
  data: {
    loading: true,
    exams: [] as any[],
    overview: {
      civilReal: { bankCount: 0, questionCount: 0 },
      other: { bankCount: 0, questionCount: 0 },
    },
  },
  async onShow() { await this.load(); },
  async onPullDownRefresh() { await this.load(); wx.stopPullDownRefresh(); },
  async load() {
    try {
      const [exams, overview] = await Promise.all([
        api.listExams(),
        api.getImportedQuestionOverview(),
      ]);
      this.setData({ exams, overview, loading: false });
    }
    catch (error: any) { this.setData({ loading: false }); wx.showToast({ title: error.message || '加载失败', icon: 'none' }); }
  },
  goImport(event?: any) {
    const kind = event?.currentTarget?.dataset?.kind;
    const query = kind ? `?kind=${kind}` : '';
    wx.navigateTo({ url: `/pkg-question/pages/import/index${query}` });
  },
  goWord() { wx.navigateTo({ url: '/pkg-word/pages/home/index' }); },
  goExam(event: any) { wx.navigateTo({ url: `/pkg-question/pages/exam/index?examId=${event.currentTarget.dataset.id}` }); },
  goWrong() { wx.navigateTo({ url: '/pkg-question/pages/wrong/index' }); },
  goFavorite() { wx.navigateTo({ url: '/pkg-question/pages/favorite/index' }); },
});
