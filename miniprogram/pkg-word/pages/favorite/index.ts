import { api } from '../../../services/api';

Page({
  data: { loading: true, items: [] as any[], query: '', mastery: '', levels: [{ value: '', label: '全部' }, { value: '0', label: '不认识' }, { value: '1', label: '模糊' }, { value: '2', label: '认识' }, { value: '3', label: '熟练' }] },
  async onShow() { await this.load(); },
  async onPullDownRefresh() { await this.load(); wx.stopPullDownRefresh(); },
  async load() { this.setData({ loading: true }); const items = await api.listFavoriteWords(this.data.query, this.data.mastery); this.setData({ items, loading: false }); },
  onInput(event: any) { this.setData({ query: event.detail.value }); },
  async search() { await this.load(); },
  async chooseLevel(event: any) { this.setData({ mastery: event.currentTarget.dataset.value }); await this.load(); },
  async remove(event: any) { await api.toggleFavoriteWord(event.currentTarget.dataset.id); await this.load(); },
  review() { wx.navigateTo({ url: '/pkg-word/pages/review/index?source=favorite' }); },
  goStudy() { wx.navigateTo({ url: '/pkg-word/pages/study/index' }); },
});
