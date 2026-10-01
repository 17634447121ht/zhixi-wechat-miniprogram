import { api } from '../../../services/api';

Page({
  data: { loading: true, detail: null as any, selectedIds: [] as string[], error: '' },
  async onLoad(options: any) {
    if (!options.chapterId) { this.setData({ loading: false, error: '缺少章节参数' }); return; }
    try {
      const detail = await api.getChapterDetail(options.chapterId);
      wx.setNavigationBarTitle({ title: detail.chapter.name });
      detail.knowledgePoints = detail.knowledgePoints.map((item: any) => ({ ...item, selected: false }));
      this.setData({ detail, loading: false });
    } catch (error: any) { this.setData({ loading: false, error: error.message || '加载失败' }); }
  },
  toggle(event: any) {
    const id = event.currentTarget.dataset.id;
    const selectedIds = this.data.selectedIds.includes(id) ? this.data.selectedIds.filter((item) => item !== id) : [...this.data.selectedIds, id];
    this.setData({ selectedIds, 'detail.knowledgePoints': this.data.detail.knowledgePoints.map((item: any) => ({ ...item, selected: selectedIds.includes(item.id) })) });
  },
  selectAll() {
    const all = this.data.detail.knowledgePoints.map((item: any) => item.id);
    const selectedIds = this.data.selectedIds.length === all.length ? [] : all;
    this.setData({ selectedIds, 'detail.knowledgePoints': this.data.detail.knowledgePoints.map((item: any) => ({ ...item, selected: selectedIds.includes(item.id) })) });
  },
  start() {
    const { detail, selectedIds } = this.data;
    const query = [`examId=${detail.exam.id}`, `subjectId=${detail.subject.id}`, `chapterIds=${detail.chapter.id}`, 'mode=SPECIAL'];
    if (selectedIds.length) query.push(`knowledgePointIds=${selectedIds.join(',')}`);
    wx.navigateTo({ url: `/pkg-question/pages/practice-config/index?${query.join('&')}` });
  },
  goBack() { wx.navigateBack(); },
});
