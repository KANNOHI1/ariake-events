export type DateParts = {
  year: number;
  month: number;
  day: number;
};

const pad2 = (value: number) => value.toString().padStart(2, "0");

export const toISODate = ({ year, month, day }: DateParts) => {
  return `${year}-${pad2(month)}-${pad2(day)}`;
};

export const isValidISODate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  return !Number.isNaN(time);
};

export const extractFullDates = (text: string): DateParts[] => {
  const results: DateParts[] = [];
  const regex = /(\d{4})\s*[./年]\s*(\d{1,2})\s*[./月]\s*(\d{1,2})\s*日?/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    results.push({
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
    });
  }
  return results;
};

export const extractMonthDay = (text: string): Array<{ month: number; day: number }> => {
  const results: Array<{ month: number; day: number }> = [];
  const mdRegex = /(\d{1,2})\s*月\s*(\d{1,2})\s*日/g;
  let match: RegExpExecArray | null;
  while ((match = mdRegex.exec(text)) !== null) {
    results.push({ month: Number(match[1]), day: Number(match[2]) });
  }
  const dotRegex = /(\d{1,2})\.(\d{1,2})/g;
  while ((match = dotRegex.exec(text)) !== null) {
    results.push({ month: Number(match[1]), day: Number(match[2]) });
  }
  return results;
};

export const parseDateRangeFromText = (text: string, fallbackYear?: number) => {
  const fullDates = extractFullDates(text);
  if (fullDates.length > 1) {
    const start = fullDates[0];
    const end = fullDates[fullDates.length - 1];
    return { start, end };
  }
  if (fullDates.length === 1) {
    const start = fullDates[0];
    const mdDates = extractMonthDay(text);
    if (mdDates.length > 1) {
      const end = { year: start.year, ...mdDates[mdDates.length - 1] };
      return { start, end };
    }
    const dayOnlyMatch = text.match(/(?:~|～|から|ー|－|-|?)\s*(\d{1,2})日/);
    if (dayOnlyMatch) {
      const end = { year: start.year, month: start.month, day: Number(dayOnlyMatch[1]) };
      return { start, end };
    }
    return { start, end: start };
  }
  const mdDates = extractMonthDay(text);
  if (mdDates.length > 0 && fallbackYear) {
    const start = { year: fallbackYear, ...mdDates[0] };
    const end = { year: fallbackYear, ...mdDates[mdDates.length - 1] };
    return { start, end };
  }
  return null;
};

export const extractYears = (text: string): number[] => {
  const results: number[] = [];
  const regex = /(20\d{2})/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    results.push(Number(match[1]));
  }
  return Array.from(new Set(results));
};

export const chooseClosestYear = (
  candidates: number[],
  month: number,
  day: number,
  referenceDate: Date
) => {
  if (candidates.length === 0) return null;
  let bestYear = candidates[0];
  let bestDiff = Number.POSITIVE_INFINITY;
  for (const year of candidates) {
    const candidateDate = new Date(Date.UTC(year, month - 1, day));
    const diff = Math.abs(candidateDate.getTime() - referenceDate.getTime());
    if (diff < bestDiff) {
      bestDiff = diff;
      bestYear = year;
    }
  }
  return bestYear;
};

