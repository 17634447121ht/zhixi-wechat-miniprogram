"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pad = pad;
exports.dateKey = dateKey;
exports.startOfDay = startOfDay;
exports.addDays = addDays;
exports.addMinutes = addMinutes;
exports.periodStart = periodStart;
exports.friendlyDate = friendlyDate;
exports.timeLabel = timeLabel;
exports.weekdayLabel = weekdayLabel;
function pad(value) {
    return String(value).padStart(2, '0');
}
function dateKey(input = new Date()) {
    const date = input instanceof Date ? input : new Date(input);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
function startOfDay(input = new Date()) {
    const date = input instanceof Date ? new Date(input) : new Date(input);
    date.setHours(0, 0, 0, 0);
    return date;
}
function addDays(input, days) {
    const date = input instanceof Date ? new Date(input) : new Date(input);
    date.setDate(date.getDate() + days);
    return date;
}
function addMinutes(input, minutes) {
    const date = input instanceof Date ? new Date(input) : new Date(input);
    date.setMinutes(date.getMinutes() + minutes);
    return date;
}
function periodStart(period) {
    const now = startOfDay();
    if (period === 'WEEK') {
        const weekday = now.getDay() || 7;
        return addDays(now, 1 - weekday);
    }
    if (period === 'MONTH')
        return new Date(now.getFullYear(), now.getMonth(), 1);
    if (period === 'TOTAL')
        return new Date(0);
    return now;
}
function friendlyDate(value) {
    if (!value)
        return '';
    const target = startOfDay(value);
    const today = startOfDay();
    const diff = Math.round((today.getTime() - target.getTime()) / 86400000);
    if (diff === 0)
        return '今天';
    if (diff === 1)
        return '昨天';
    const date = new Date(value);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
}
function timeLabel(value) {
    if (!value)
        return '';
    const date = new Date(value);
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function weekdayLabel(value) {
    return ['日', '一', '二', '三', '四', '五', '六'][value.getDay()];
}
