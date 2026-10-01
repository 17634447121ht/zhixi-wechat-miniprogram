import { api } from '../../../services/api';

Page({
  data: { loading: true, detail: null as any, error: '' },
  async onLoad(options: any) {
    if (!options.sessionId) { this.setData({ loading: false, error: '记录参数已失效' }); return; }
    try { this.setData({ detail: await api.getHistoryDetail(options.sessionId), loading: false }); }
    catch (error: any) { this.setData({ loading: false, error: error.message || '记录加载失败' }); }
  },
  goBack() { wx.navigateBack(); },
});
