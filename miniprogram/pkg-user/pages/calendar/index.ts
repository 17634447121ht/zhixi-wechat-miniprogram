import { api } from '../../../services/api';

Page({
  data: { loading: true, year: new Date().getFullYear(), month: new Date().getMonth() + 1, calendar: null as any, weekdays: ['一', '二', '三', '四', '五', '六', '日'] },
  async onLoad() { await this.load(); },
  async load() { this.setData({ loading: true }); const calendar = await api.getCalendar(this.data.year, this.data.month); this.setData({ calendar, loading: false }); },
  async previous() {
    let { year, month } = this.data; month -= 1; if (month < 1) { month = 12; year -= 1; }
    this.setData({ year, month }); await this.load();
  },
  async next() {
    let { year, month } = this.data; month += 1; if (month > 12) { month = 1; year += 1; }
    this.setData({ year, month }); await this.load();
  },
});
