export function normalizeKeys(keys: string[]): string[] {
  return Array.from(new Set(keys || [])).map((item) => String(item)).sort();
}

export function answersEqual(left: string[], right: string[]): boolean {
  return normalizeKeys(left).join('|') === normalizeKeys(right).join('|');
}

export function shuffled<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function uniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
