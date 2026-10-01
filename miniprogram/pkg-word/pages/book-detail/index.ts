import { api } from '../../../services/api';

Page({
  data: { loading: true, book: null as any, error: '', selecting: false },
  async onLoad(options: any) {
    if (!options.bookId) { this.setData({ loading: false, error: '缺少词书参数' }); return; }
    try { const book = await api.getWordBookDetail(options.bookId); wx.setNavigationBarTitle({ title: book.name }); this.setData({ book, loading: false }); }
    catch (error: any) { this.setData({ loading: false, error: error.message || '词书加载失败' }); }
  },
  async choose() {
    if (this.data.selecting) return;
    this.setData({ selecting: true });
    try { await api.selectWordBook(this.data.book.id); wx.showToast({ title: '已设为当前词书', icon: 'success' }); setTimeout(() => wx.navigateBack(), 300); }
    catch (error: any) { wx.showToast({ title: error.message || '设置失败', icon: 'none' }); }
    finally { this.setData({ selecting: false }); }
  },
  goBack() { wx.navigateBack(); },
});
