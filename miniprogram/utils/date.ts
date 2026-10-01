export function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function dateKey(input: Date | string | number = new Date()): string {
  const date = input instanceof Date ? input : new Date(input);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function startOfDay(input: Date | string | number = new Date()): Date {
  const date = input instanceof Date ? new Date(input) : new Date(input);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function addDays(input: Date | string | number, days: number): Date {
  const date = input instanceof Date ? new Date(input) : new Date(input);
  date.setDate(date.getDate() + days);
  return date;
}

export function addMinutes(input: Date | string | number, minutes: number): Date {
  const date = input instanceof Date ? new Date(input) : new Date(input);
  date.setMinutes(date.getMinutes() + minutes);
  return date;
}

export function periodStart(period: 'TODAY' | 'WEEK' | 'MONTH' | 'TOTAL'): Date {
  const now = startOfDay();
  if (period === 'WEEK') {
    const weekday = now.getDay() || 7;
    return addDays(now, 1 - weekday);
  }
  if (period === 'MONTH') return new Date(now.getFullYear(), now.getMonth(), 1);
  if (period === 'TOTAL') return new Date(0);
  return now;
}

export function friendlyDate(value?: string): string {
  if (!value) return '';
  const target = startOfDay(value);
  const today = startOfDay();
  const diff = Math.round((today.getTime() - target.getTime()) / 86400000);
  if (diff === 0) return '今天';
  if (diff === 1) return '昨天';
  const date = new Date(value);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export function timeLabel(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function weekdayLabel(value: Date): string {
  return ['日', '一', '二', '三', '四', '五', '六'][value.getDay()];
}
