import { api } from '../../../services/api';

Page({
  data: { loading: true, subjects: [] as any[] },
  async onLoad() { this.setData({ subjects: await api.getSubjectAnalysis(), loading: false }); },
  open(event: any) { wx.navigateTo({ url: `/pkg-question/pages/subject/index?subjectId=${event.currentTarget.dataset.id}` }); },
  goBank() { wx.switchTab({ url: '/pages/question-bank/index' }); },
});
