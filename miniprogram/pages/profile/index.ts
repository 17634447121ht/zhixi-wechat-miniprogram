import { api } from '../../services/api';

Page({
  data: {
    loading: true,
    profile: null as any,
    stats: null as any,
    menus: [
      { icon: '统', title: '学习统计', note: '查看学习趋势与正确率', url: '/pkg-user/pages/statistics/index' },
      { icon: '错', title: '错题本', note: '复习尚未掌握的题目', url: '/pkg-question/pages/wrong/index' },
      { icon: '★', title: '我的收藏', note: '题目与单词分开管理', url: '/pkg-question/pages/favorite/index' },
      { icon: '词', title: '生词本', note: '搜索和复习收藏单词', url: '/pkg-word/pages/favorite/index' },
      { icon: '历', title: '做题记录', note: '回看每一次练习', url: '/pkg-question/pages/history/index' },
      { icon: '设', title: '学习设置', note: '调整每日目标与答题偏好', url: '/pkg-user/pages/settings/index' },
      { icon: '关', title: '关于知习', note: '版本、隐私与反馈说明', url: '/pkg-user/pages/about/index' }
    ],
  },
  async onShow() { await this.load(); },
  async onPullDownRefresh() { await this.load(); wx.stopPullDownRefresh(); },
  async load() {
    const profile = await api.getProfile();
    if (!profile) { this.setData({ loading: false }); wx.navigateTo({ url: '/pages/login/index' }); return; }
    const stats = await api.getStatistics('TOTAL');
    this.setData({ profile: { ...profile, initial: (profile.nickname || '知').charAt(0) }, stats, loading: false });
  },
  openMenu(event: any) { wx.navigateTo({ url: event.currentTarget.dataset.url }); },
  editProfile() { wx.navigateTo({ url: '/pkg-user/pages/profile-edit/index' }); },
});
