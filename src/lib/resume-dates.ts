const months: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  spring: '03', summer: '06', fall: '09', autumn: '09', winter: '12',
};

/** Converts a resume date (`Mon YYYY`, `YYYY` or `Fall YYYY`) to an ISO year or year-month. */
export function isoDate(value?: string): string | undefined {
  if (!value) return undefined;
  const year = value.match(/^(\d{4})$/);
  if (year) return year[1];
  const monthYear = value.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (!monthYear) return undefined;
  const key = monthYear[1].toLowerCase();
  const month = months[key] ?? months[key.slice(0, 3)];
  return month ? `${monthYear[2]}-${month}` : undefined;
}
