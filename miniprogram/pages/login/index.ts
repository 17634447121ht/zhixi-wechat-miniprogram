import { api } from '../../services/api';

Page({
  data: {
    nickname: '',
    loading: false,
  },

  async onLoad() {
    const profile = await api.getProfile();
    if (profile) wx.switchTab({ url: '/pages/home/index' });
  },

  onNicknameInput(event: any) {
    this.setData({ nickname: event.detail.value });
  },

  async login() {
    if (this.data.loading) return;
    this.setData({ loading: true });
    try {
      const user = await api.login(this.data.nickname || '学习者');
      getApp<IAppOption>().globalData.user = user;
      wx.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => wx.switchTab({ url: '/pages/home/index' }), 250);
    } catch (error: any) {
      wx.showToast({ title: error.message || '登录失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },
});
