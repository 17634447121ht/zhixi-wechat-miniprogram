import { api } from '../../../services/api';

Page({
  data: { loading: true, dashboard: null as any },
  async onShow() { await this.load(); },
  async onPullDownRefresh() { await this.load(); wx.stopPullDownRefresh(); },
  async load() {
    try { this.setData({ dashboard: await api.getWordHome(), loading: false }); }
    catch (error: any) { this.setData({ loading: false }); wx.showToast({ title: error.message || '加载失败', icon: 'none' }); }
  },
  goBooks() { wx.navigateTo({ url: '/pkg-word/pages/book-list/index' }); },
  goStudy() { wx.navigateTo({ url: '/pkg-word/pages/study/index' }); },
  goReview() { wx.navigateTo({ url: '/pkg-word/pages/review/index' }); },
  goTest() { wx.navigateTo({ url: '/pkg-word/pages/test/index' }); },
  goFavorite() { wx.navigateTo({ url: '/pkg-word/pages/favorite/index' }); },
  goProgress() { wx.navigateTo({ url: '/pkg-word/pages/progress/index' }); },
});
