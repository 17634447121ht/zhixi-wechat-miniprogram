import { api } from '../../services/api';

Page({
  data: {
    loading: true,
    overview: null as any,
  },

  async onShow() {
    const profile = await api.getProfile();
    if (!profile) {
      this.setData({ loading: false });
      wx.navigateTo({ url: '/pages/login/index' });
      return;
    }
    await this.load();
  },

  async onPullDownRefresh() {
    await this.load();
    wx.stopPullDownRefresh();
  },

  async load() {
    try {
      const overview = await api.getHome();
      this.setData({ overview, loading: false });
    } catch (error: any) {
      this.setData({ loading: false });
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    }
  },

  goWord() { wx.navigateTo({ url: '/pkg-word/pages/home/index' }); },
  goExam(event: any) { wx.navigateTo({ url: `/pkg-question/pages/exam/index?examId=${event.currentTarget.dataset.id}` }); },
  goSettings() { wx.navigateTo({ url: '/pkg-user/pages/settings/index' }); },
  goHistory() { wx.navigateTo({ url: '/pkg-question/pages/history/index' }); },
  goStatistics() { wx.navigateTo({ url: '/pkg-user/pages/statistics/index' }); },
  openHistory(event: any) { wx.navigateTo({ url: `/pkg-question/pages/history-detail/index?sessionId=${event.currentTarget.dataset.id}` }); },
  resume() { wx.navigateTo({ url: `/pkg-question/pages/practice/index?sessionId=${this.data.overview.unfinished.sessionId}` }); },
});
