"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeKeys = normalizeKeys;
exports.answersEqual = answersEqual;
exports.shuffled = shuffled;
exports.uniqueId = uniqueId;
function normalizeKeys(keys) {
    return Array.from(new Set(keys || [])).map((item) => String(item)).sort();
}
function answersEqual(left, right) {
    return normalizeKeys(left).join('|') === normalizeKeys(right).join('|');
}
function shuffled(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
}
function uniqueId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
