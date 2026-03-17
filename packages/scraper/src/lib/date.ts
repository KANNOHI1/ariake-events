const pad2 = (n: number) => n.toString().padStart(2, "0");

export const toISODate = (year: number, month: number, day: number): string =>
  `${year}-${pad2(month)}-${pad2(day)}`;

export const isValidISODate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(value);
};

type DateRange = { start: string; end: string };

// YYYY年MM月DD日, YYYY/MM/DD, YYYY.MM.DD, YYYY-M-D
const FULL_DATE = /(\d{4})\s*[年/.\-]\s*(\d{1,2})\s*[月/.\-]?\s*(\d{1,2})\s*日?/g;
// M月D日 or M/D
const MONTH_DAY = /(\d{1,2})\s*[月/]\s*(\d{1,2})\s*日?/g;

export const parseDateRange = (text: string): DateRange | null => {
  const fullDates: Array<{ year: number; month: number; day: number }> = [];
  let m: RegExpExecArray | null;
  const fullRegex = new RegExp(FULL_DATE.source, "g");
  while ((m = fullRegex.exec(text)) !== null) {
    fullDates.push({ year: +m[1], month: +m[2], day: +m[3] });
  }

  if (fullDates.length >= 2) {
    const s = fullDates[0];
    const e = fullDates[fullDates.length - 1];
    return {
      start: toISODate(s.year, s.month, s.day),
      end: toISODate(e.year, e.month, e.day),
    };
  }

  if (fullDates.length === 1) {
    const s = fullDates[0];
    const startStr = toISODate(s.year, s.month, s.day);

    // Check for month-day only end after separator
    const sepIdx =
      text.indexOf("～") !== -1
        ? text.indexOf("～")
        : text.indexOf("~") !== -1
          ? text.indexOf("~")
          : -1;

    if (sepIdx !== -1) {
      const afterSep = text.slice(sepIdx + 1);
      const mdRegex = new RegExp(MONTH_DAY.source);
      const mdMatch = mdRegex.exec(afterSep);
      if (mdMatch) {
        const endMonth = +mdMatch[1];
        const endDay = +mdMatch[2];
        const endYear = endMonth < s.month ? s.year + 1 : s.year;
        return { start: startStr, end: toISODate(endYear, endMonth, endDay) };
      }
    }

    return { start: startStr, end: startStr };
  }

  return null;
};
