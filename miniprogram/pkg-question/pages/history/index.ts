import { api } from '../../../services/api';

Page({
  data: { loading: true, items: [] as any[] },
  async onShow() { this.setData({ loading: true }); const items = await api.listHistory(); this.setData({ items, loading: false }); },
  async onPullDownRefresh() { await this.onShow(); wx.stopPullDownRefresh(); },
  open(event: any) { wx.navigateTo({ url: `/pkg-question/pages/history-detail/index?sessionId=${event.currentTarget.dataset.id}` }); },
  goBank() { wx.switchTab({ url: '/pages/question-bank/index' }); },
});
