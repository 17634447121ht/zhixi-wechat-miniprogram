import type { ImportedQuestionBank } from '../types/index';

const INDEX_KEY = 'zhixi.imported.question-banks.index.v1';
const BANK_KEY_PREFIX = 'zhixi.imported.question-bank.v1:';

function bankKey(bankId: string): string {
  return `${BANK_KEY_PREFIX}${bankId}`;
}

function utf8ByteLength(value: string): number {
  return encodeURIComponent(value).replace(/%[0-9A-F]{2}|./gi, 'x').length;
}

export function loadImportedQuestionBanks(): ImportedQuestionBank[] {
  try {
    const ids = wx.getStorageSync(INDEX_KEY);
    if (!Array.isArray(ids)) return [];
    return ids.map((id) => wx.getStorageSync(bankKey(String(id)))).filter(Boolean) as ImportedQuestionBank[];
  } catch (_error) {
    return [];
  }
}

export function saveImportedQuestionBank(bank: ImportedQuestionBank): void {
  const serialized = JSON.stringify(bank);
  if (utf8ByteLength(serialized) > 800 * 1024) throw new Error('单套题库过大，请拆分为多个文件后导入');
  const ids = wx.getStorageSync(INDEX_KEY);
  const nextIds = Array.isArray(ids) ? ids.map(String) : [];
  if (!nextIds.includes(bank.id)) nextIds.unshift(bank.id);
  wx.setStorageSync(bankKey(bank.id), bank);
  wx.setStorageSync(INDEX_KEY, nextIds);
}
