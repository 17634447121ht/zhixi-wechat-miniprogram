import { api } from '../../../services/api';

Page({
  data: { loading: true, detail: null as any, error: '' },
  async onLoad(options: any) {
    if (!options.subjectId) { this.setData({ loading: false, error: '缺少科目参数' }); return; }
    try {
      const detail = await api.getSubjectDetail(options.subjectId);
      wx.setNavigationBarTitle({ title: `${detail.subject.name} · 章节` });
      this.setData({ detail, loading: false });
    } catch (error: any) { this.setData({ loading: false, error: error.message || '加载失败' }); }
  },
  openKnowledge(event: any) { wx.navigateTo({ url: `/pkg-question/pages/knowledge/index?chapterId=${event.currentTarget.dataset.id}` }); },
  goBack() { wx.navigateBack(); },
});
