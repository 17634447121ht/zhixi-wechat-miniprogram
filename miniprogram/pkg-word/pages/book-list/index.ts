import { api } from '../../../services/api';

Page({
  data: { loading: true, books: [] as any[] },
  async onShow() { this.setData({ books: await api.listWordBooks(), loading: false }); },
  open(event: any) { wx.navigateTo({ url: `/pkg-word/pages/book-detail/index?bookId=${event.currentTarget.dataset.id}` }); },
});
