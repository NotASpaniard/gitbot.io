/** Khoảng cách Levenshtein, dùng để gợi ý lệnh khi người dùng gõ sai. */
function distance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost,
      );
    }
    previous = current;
  }

  return previous[b.length];
}

/** Trả về lệnh gần giống nhất, hoặc null nếu không đủ giống để gợi ý. */
export function closestMatch(
  input: string,
  candidates: string[],
): string | null {
  const needle = input.toLowerCase();
  let best: string | null = null;
  let bestScore = Infinity;

  for (const candidate of candidates) {
    const score = distance(needle, candidate.toLowerCase());
    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  // Chỉ gợi ý khi sai ở mức "gõ nhầm phím", không phải lệnh hoàn toàn khác.
  const threshold = needle.length <= 4 ? 2 : 3;
  return bestScore <= threshold ? best : null;
}

/** Tiền tố chung dài nhất — dùng cho autocomplete bằng phím Tab. */
export function commonPrefix(values: string[]): string {
  if (!values.length) return "";
  let prefix = values[0];
  for (const value of values.slice(1)) {
    while (!value.startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (!prefix) return "";
    }
  }
  return prefix;
}
