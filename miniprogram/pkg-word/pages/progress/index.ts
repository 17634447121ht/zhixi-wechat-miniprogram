import { api } from '../../../services/api';

Page({
  data: { loading: true, progress: null as any },
  async onShow() { this.setData({ progress: await api.getWordProgress(), loading: false }); },
  goStudy() { wx.navigateTo({ url: '/pkg-word/pages/study/index' }); },
  goReview() { wx.navigateTo({ url: '/pkg-word/pages/review/index' }); },
});
