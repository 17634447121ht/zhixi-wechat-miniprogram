import { api } from '../../../services/api';

Page({
  data: { loading: true, detail: null as any, error: '' },
  async onLoad(options: any) {
    if (!options.examId) { this.setData({ loading: false, error: '缺少考试分类参数' }); return; }
    try {
      const detail = await api.getExamDetail(options.examId);
      wx.setNavigationBarTitle({ title: detail.exam.shortName });
      this.setData({ detail, loading: false });
    } catch (error: any) { this.setData({ loading: false, error: error.message || '加载失败' }); }
  },
  openSubject(event: any) { wx.navigateTo({ url: `/pkg-question/pages/subject/index?subjectId=${event.currentTarget.dataset.id}` }); },
  goBack() { wx.navigateBack(); },
});
