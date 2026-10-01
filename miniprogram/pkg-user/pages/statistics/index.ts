import { api } from '../../../services/api';
import type { StatisticsPeriod } from '../../../types/index';

Page({
  data: {
    loading: true,
    period: 'TODAY' as StatisticsPeriod,
    periods: [{ value: 'TODAY', label: '今日' }, { value: 'WEEK', label: '本周' }, { value: 'MONTH', label: '本月' }, { value: 'TOTAL', label: '总计' }],
    stats: null as any,
  },
  async onShow() { await this.load(); },
  async onPullDownRefresh() { await this.load(); wx.stopPullDownRefresh(); },
  async load() { this.setData({ loading: true }); const stats = await api.getStatistics(this.data.period); this.setData({ stats, loading: false }); },
  async choosePeriod(event: any) { this.setData({ period: event.currentTarget.dataset.value }); await this.load(); },
  goCalendar() { wx.navigateTo({ url: '/pkg-user/pages/calendar/index' }); },
  goSubjects() { wx.navigateTo({ url: '/pkg-user/pages/subject-analysis/index' }); },
  goWeak() { wx.navigateTo({ url: '/pkg-user/pages/weak-points/index' }); },
  goBank() { wx.switchTab({ url: '/pages/question-bank/index' }); },
});
