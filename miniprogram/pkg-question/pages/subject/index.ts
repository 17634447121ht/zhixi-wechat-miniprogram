import { api } from '../../../services/api';

Page({
  data: { loading: true, detail: null as any, error: '' },
  async onLoad(options: any) {
    if (!options.subjectId) { this.setData({ loading: false, error: '缺少科目参数' }); return; }
    try {
      const detail = await api.getSubjectDetail(options.subjectId);
      wx.setNavigationBarTitle({ title: detail.subject.name });
      this.setData({ detail, loading: false });
    } catch (error: any) { this.setData({ loading: false, error: error.message || '加载失败' }); }
  },
  startPractice(event: any) {
    const mode = event.currentTarget.dataset.mode;
    wx.navigateTo({ url: `/pkg-question/pages/practice-config/index?subjectId=${this.data.detail.subject.id}&examId=${this.data.detail.exam.id}&mode=${mode}` });
  },
  openChapter(event: any) { wx.navigateTo({ url: `/pkg-question/pages/knowledge/index?chapterId=${event.currentTarget.dataset.id}` }); },
  openChapters() { wx.navigateTo({ url: `/pkg-question/pages/chapter/index?subjectId=${this.data.detail.subject.id}` }); },
  goBack() { wx.navigateBack(); },
});
