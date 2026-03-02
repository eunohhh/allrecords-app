const KST_OFFSET_HOURS = 9;

export const buildCalendarRange = (targetDate: Date) => {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const kstOffsetMs = KST_OFFSET_HOURS * 60 * 60 * 1000;
  const kstMonthStartUtc = new Date(Date.UTC(year, month, 1, -KST_OFFSET_HOURS));
  const startDay = new Date(kstMonthStartUtc.getTime() + kstOffsetMs).getUTCDay();
  const from = new Date(kstMonthStartUtc);
  from.setUTCDate(from.getUTCDate() - startDay);

  const kstMonthEndUtc = new Date(
    Date.UTC(year, month + 1, 0, 23 - KST_OFFSET_HOURS, 59, 59, 999),
  );
  const endDay = new Date(kstMonthEndUtc.getTime() + kstOffsetMs).getUTCDay();
  const to = new Date(kstMonthEndUtc);
  to.setUTCDate(to.getUTCDate() + (6 - endDay));
  return { from, to };
};

export const toKstStartUtc = (date: Date) =>
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), -KST_OFFSET_HOURS));

export const toKstEndUtc = (date: Date) =>
  new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23 - KST_OFFSET_HOURS,
      59,
      59,
      999,
    ),
  );

export const normalizeDateOnly = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export const formatShortDate = (date: Date) =>
  date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

export default {}