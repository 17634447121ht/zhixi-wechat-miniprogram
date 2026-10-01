import { api } from '../../../services/api';

Page({
  data: { loading: true, items: [] as any[] },
  async onShow() { this.setData({ items: await api.getWeakPoints(), loading: false }); },
  practice(event: any) {
    const item = this.data.items.find((candidate: any) => candidate.knowledgePointId === event.currentTarget.dataset.id);
    if (!item) return;
    wx.navigateTo({ url: `/pkg-question/pages/practice-config/index?mode=SPECIAL&subjectId=${item.subjectId}&chapterIds=${item.chapterId}&knowledgePointIds=${item.knowledgePointId}` });
  },
  goBank() { wx.switchTab({ url: '/pages/question-bank/index' }); },
});
