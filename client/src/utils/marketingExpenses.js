import moment from 'moment';

export const EXPENSE_CATEGORIES = [
  { value: 'facebook', text: 'פייסבוק', pattern: /פייסבוק|facebook/ },
  { value: 'google', text: 'גוגל', pattern: /גוגל|google/ },
  { value: 'tiktok', text: 'טיקטוק', pattern: /טיק\s*טוק|tiktok/ },
  { value: 'yad2', text: 'יד 2', pattern: /יד\s*2|yad2/ },
  { value: 'madlan', text: 'מדלן', pattern: /מדלן|madlan/ },
  { value: 'print', text: 'דפוס ועיתונות', pattern: /ידיעות|הדפס|פרוספקט|הגדות/ },
  { value: 'signage', text: 'שילוט', pattern: /שילוט|שלטי|שלטים/ },
  { value: 'events', text: 'אירועים וירידים', pattern: /יריד|כנס/ },
  { value: 'digital', text: 'שירותי דיגיטל וניהול קמפיינים', pattern: /דיגיטל|דיגטלי|קמפיי?ן|קמפיינים|סושיאל|וויקס|wix/ },
  { value: 'brokerage', text: 'תיווך ועמלות שיווק', pattern: /תיווך|תיוון|עמלת|שכט\s*שיווק/ },
  { value: 'creative', text: 'צילום והדמיות', pattern: /צילום|צילומי|הדמי|\bvr\b/ },
  { value: 'other', text: 'אחר / לא מסווג' },
];

export function normalizeDescription(value) {
  return String(value || '').toLowerCase().replace(/["'׳״’`]/g, '').replace(/\s+/g, ' ').trim();
}

export function classifyExpense(row) {
  const text = normalizeDescription(row.pratim);
  const matches = EXPENSE_CATEGORIES.filter(category => category.pattern && category.pattern.test(text));
  // Multiple explicit platforms cannot be allocated reliably from the description alone.
  if (matches.filter(category => ['facebook', 'google', 'tiktok', 'yad2', 'madlan'].includes(category.value)).length > 1) return 'other';
  return matches.length ? matches[0].value : 'other';
}

export function expenseAmount(row) {
  const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;
  return number(row.schum_hova) - number(row.schum_zchut);
}

export function expenseMonth(row) {
  if (!row.asmchta_date) return null;
  const date = moment(row.asmchta_date);
  return date.isValid() ? date.format('YYYY-MM') : null;
}

export function monthlyExpenses(rows, categories) {
  const months = rows.map(expenseMonth).filter(Boolean).sort();
  if (!months.length) return { months: [], series: [] };
  const keys = [];
  const cursor = moment(months[0], 'YYYY-MM');
  const end = moment(months[months.length - 1], 'YYYY-MM');
  while (cursor.isSameOrBefore(end, 'month')) {
    keys.push(cursor.format('YYYY-MM'));
    cursor.add(1, 'month');
  }
  const totals = new Map();
  rows.forEach(row => {
    const key = `${classifyExpense(row)}:${expenseMonth(row)}`;
    totals.set(key, (totals.get(key) || 0) + expenseAmount(row));
  });
  return {
    months: keys,
    series: categories.map(value => ({
      name: EXPENSE_CATEGORIES.find(category => category.value === value).text,
      data: keys.map(month => totals.get(`${value}:${month}`) || 0),
    })),
  };
}
