import { api } from '../../../services/api';

Page({
  data: { loading: true, sessionId: '', result: null as any, session: null as any, error: '' },
  async onLoad(options: any) {
    if (!options.sessionId) { this.setData({ loading: false, error: '报告参数已失效' }); return; }
    this.setData({ sessionId: options.sessionId });
    try {
      const [result, session] = await Promise.all([api.getSessionResult(options.sessionId), api.getSession(options.sessionId)]);
      this.setData({ result, session: session.session, loading: false });
    } catch (error: any) { this.setData({ loading: false, error: error.message || '报告加载失败' }); }
  },
  viewWrong() { wx.redirectTo({ url: '/pkg-question/pages/wrong/index' }); },
  again() {
    const config = this.data.session.config;
    const query = [
      `mode=${config.practiceType}`,
      `examId=${config.examId || ''}`,
      `subjectId=${config.subjectId || ''}`,
      `chapterIds=${(config.chapterIds || []).join(',')}`,
      `knowledgePointIds=${(config.knowledgePointIds || []).join(',')}`,
      `difficulty=${(config.difficulty || []).join(',')}`,
      `count=${config.count || 5}`,
      `questionBankId=${config.questionBankId || ''}`,
      `bankTitle=${config.questionBankId ? encodeURIComponent(this.data.result.title) : ''}`,
    ];
    wx.redirectTo({ url: `/pkg-question/pages/practice-config/index?${query.join('&')}` });
  },
  goBank() { wx.switchTab({ url: '/pages/question-bank/index' }); },
  goBack() { wx.navigateBack(); },
});
