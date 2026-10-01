import { api } from '../../../services/api';

Page({
  data: { loading: true, saving: false, settings: null as any },
  async onLoad() { this.setData({ settings: await api.getSettings(), loading: false }); },
  onNumber(event: any) {
    const key = event.currentTarget.dataset.key;
    const value = Math.max(1, Math.min(500, Number(event.detail.value) || 1));
    this.setData({ [`settings.${key}`]: value });
  },
  onSwitch(event: any) { this.setData({ [`settings.${event.currentTarget.dataset.key}`]: event.detail.value }); },
  async save() {
    if (this.data.saving) return;
    this.setData({ saving: true });
    try { await api.updateSettings(this.data.settings); wx.showToast({ title: '已保存', icon: 'success' }); setTimeout(() => wx.navigateBack(), 250); }
    catch (error: any) { wx.showToast({ title: error.message || '保存失败', icon: 'none' }); }
    finally { this.setData({ saving: false }); }
  },
});
