/**
 * Centralized Date Utilities for Marian Coaching Web App
 * Default format: American "MM/DD/YYYY"
 */

export function formatDateToMMDDYYYY(
  val: string | number | Date | null | undefined,
  fallback = ''
): string {
  if (val === null || val === undefined || val === '') return fallback;

  // If already Date object
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return fallback;
    const mm = String(val.getMonth() + 1).padStart(2, '0');
    const dd = String(val.getDate()).padStart(2, '0');
    const yyyy = val.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }

  // If number timestamp
  if (typeof val === 'number') {
    const d = new Date(val);
    if (isNaN(d.getTime())) return fallback;
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }

  const str = String(val).trim();
  if (!str) return fallback;

  // Handle YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
  if (/^\d{4}-\d{1,2}-\d{1,2}/.test(str)) {
    const cleanDatePart = str.split('T')[0];
    const parts = cleanDatePart.split('-');
    if (parts.length === 3) {
      const yyyy = parts[0];
      const mm = parts[1].padStart(2, '0');
      const dd = parts[2].padStart(2, '0');
      return `${mm}/${dd}/${yyyy}`;
    }
  }

  // Handle slash formats (e.g. MM/DD/YYYY or DD/MM/YYYY or MM/DD/YY or DD/MM/YY)
  if (str.includes('/')) {
    const p = str.split('/');
    if (p.length === 3) {
      let year = p[2].trim();
      if (year.length === 2) {
        year = `20${year}`;
      }

      let p0 = parseInt(p[0], 10);
      let p1 = parseInt(p[1], 10);

      // If p[0] > 12, it's definitely DD/MM/YYYY -> convert to MM/DD/YYYY
      if (p0 > 12 && p1 <= 12) {
        const mm = String(p1).padStart(2, '0');
        const dd = String(p0).padStart(2, '0');
        return `${mm}/${dd}/${year}`;
      }

      // Otherwise assume MM/DD/YYYY
      const mm = String(p0).padStart(2, '0');
      const dd = String(p1).padStart(2, '0');
      return `${mm}/${dd}/${year}`;
    }
  }

  // Try standard Date parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    const yyyy = parsed.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }

  return str;
}

export function getCurrentDateMMDDYYYY(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export function formatToISODate(val: string): string {
  if (!val) return '';
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const parts = str.split('/');
    let mm = parts[0].padStart(2, '0');
    let dd = parts[1].padStart(2, '0');
    const yyyy = parts[2];
    // If mm > 12, user typed DD/MM/YYYY -> swap
    if (parseInt(mm, 10) > 12 && parseInt(dd, 10) <= 12) {
      const tmp = mm;
      mm = dd;
      dd = tmp;
    }
    return `${yyyy}-${mm}-${dd}`;
  }
  return '';
}
