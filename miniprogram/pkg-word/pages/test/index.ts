import { api } from '../../../services/api';

Page({
  data: { loading: true, tests: [] as any[], index: 0, current: null as any, selectedKey: '', result: null as any, score: 0, finished: false, submitting: false },
  async onLoad() {
    try { const tests = await api.createWordTests(); this.setData({ tests, current: tests[0] || null, loading: false }); }
    catch (error: any) { this.setData({ loading: false }); wx.showToast({ title: error.message || '加载失败', icon: 'none' }); }
  },
  choose(event: any) { if (!this.data.result) this.setData({ selectedKey: event.currentTarget.dataset.key }); },
  async submit() {
    if (!this.data.selectedKey) { wx.showToast({ title: '请选择一个答案', icon: 'none' }); return; }
    if (this.data.submitting || this.data.result) return;
    this.setData({ submitting: true });
    try { const result = await api.submitWordTest(this.data.current.id, this.data.selectedKey); this.setData({ result, score: this.data.score + (result.correct ? 1 : 0), submitting: false }); }
    catch (error: any) { this.setData({ submitting: false }); wx.showToast({ title: error.message || '提交失败', icon: 'none' }); }
  },
  next() {
    const index = this.data.index + 1;
    if (index >= this.data.tests.length) { this.setData({ finished: true, current: null }); return; }
    this.setData({ index, current: this.data.tests[index], selectedKey: '', result: null });
  },
  restart() { this.setData({ loading: true, tests: [], index: 0, current: null, selectedKey: '', result: null, score: 0, finished: false }); this.onLoad(); },
  goHome() { wx.redirectTo({ url: '/pkg-word/pages/home/index' }); },
});
