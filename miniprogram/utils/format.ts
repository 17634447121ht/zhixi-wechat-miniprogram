export function percent(value: number, total: number): number {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

export function durationLabel(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds || 0));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  if (!minutes) return `${rest}秒`;
  return `${minutes}分${rest ? `${rest}秒` : ''}`;
}

export function modeLabel(mode: string): string {
  const labels: Record<string, string> = {
    ORDER: '顺序练习',
    RANDOM: '随机练习',
    SPECIAL: '专项练习',
    WRONG: '错题练习',
    FAVORITE: '收藏练习',
  };
  return labels[mode] || '练习';
}

export function questionTypeLabel(type: string): string {
  return { SINGLE: '单选题', MULTIPLE: '多选题', JUDGE: '判断题' }[type] || '题目';
}

export function ratingLabel(rating: number): string {
  return ['不认识', '模糊', '认识', '熟练'][rating] || '未学习';
}
