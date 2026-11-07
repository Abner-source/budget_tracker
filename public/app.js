'use strict';

/* ================= Data ================= */

const STORE_KEY = 'budget-tracker-v1';

const CAT_ICONS = {
  food: '<path d="M7 3v7M5 3v4.5a2 2 0 0 0 4 0V3M7 10v11M18 3c-2 1-3.5 4-3.5 8H18v10"/>',
  coffee: '<path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3"/>',
  cart: '<path d="M3 4h2l2.4 11h10.2L20 7.5H6.1"/><circle cx="9" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/>',
  scissors: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8.2 7.3 20 18M8.2 16.7 20 6"/>',
  bus: '<rect x="5" y="3" width="14" height="15" rx="2"/><path d="M5 11h14M8 18v3M16 18v3"/><circle cx="8.5" cy="14.5" r=".8"/><circle cx="15.5" cy="14.5" r=".8"/>',
  car: '<path d="M4 16v-4l2-5h12l2 5v4zM4 16v3h3v-3M17 16v3h3v-3M4 12h16"/><circle cx="8" cy="14" r=".6"/><circle cx="16" cy="14" r=".6"/>',
  gamepad: '<rect x="2.5" y="7" width="19" height="11" rx="5.5"/><path d="M7 12.5h4M9 10.5v4"/><circle cx="15.5" cy="11.5" r=".8"/><circle cx="17.5" cy="13.8" r=".8"/>',
  ticket: '<path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z"/><path d="M14 7v2M14 11v2M14 15v2"/>',
  repeat: '<path d="M4 11V9a3 3 0 0 1 3-3h12l-3-3M20 13v2a3 3 0 0 1-3 3H5l3 3"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  bag: '<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
  home: '<path d="M4 11 12 4l8 7M6 9.5V20h12V9.5M10 20v-5h4v5"/>',
  bolt: '<path d="M13 3 5 13h6l-1 8 8-10h-6z"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2zM4 20a2 2 0 0 0 2 2h13v-4"/>',
  gift: '<path d="M4 10h16v4H4zM5 14h14v7H5zM12 10v11M12 10c-2-4-6-4-6-1.5S10 10 12 10c2 0 6 1 6-1.5S14 6 12 10"/>',
  plane: '<path d="M3 13.5 21 6l-4 14-5-5-3 3v-5z"/><path d="M12 15l9-9"/>',
  pie: '<path d="M11 4a8.5 8.5 0 1 0 9 9h-9z"/><path d="M14 3v7h7a7 7 0 0 0-7-7z"/>',
  paw: '<circle cx="7" cy="10" r="1.6"/><circle cx="10" cy="6" r="1.6"/><circle cx="14" cy="6" r="1.6"/><circle cx="17" cy="10" r="1.6"/><path d="M12 12c-3 0-5 4-5 6a2 2 0 0 0 2 2c1.2 0 2-.6 3-.6s1.8.6 3 .6a2 2 0 0 0 2-2c0-2-2-6-5-6z"/>',
  dots: '<circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/>',
};

const UI_ICONS = {
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  left: '<path d="M15 5l-7 7 7 7"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  plus: '<path d="M12 3v18M3 12h18"/>',
  user: '<circle cx="12" cy="9" r="3.5"/><path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 15V4M7 9l5-5 5 5M5 20h14"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
};

const DEFAULT_CATEGORIES = [
  { id: 'eating-out', name: 'Eating Out', icon: 'food' },
  { id: 'groceries', name: 'Groceries', icon: 'cart' },
  { id: 'grooming', name: 'Haircut & Grooming', icon: 'scissors' },
  { id: 'transport', name: 'Transport', icon: 'bus' },
  { id: 'entertainment', name: 'Entertainment', icon: 'gamepad' },
  { id: 'subscriptions', name: 'Subscriptions', icon: 'repeat' },
  { id: 'health', name: 'Health', icon: 'heart' },
  { id: 'shopping', name: 'Shopping', icon: 'bag' },
  { id: 'other', name: 'Other', icon: 'dots' },
];

// ISO country code → ISO currency code. Country names come from Intl.DisplayNames.
const CURRENCY_BY_COUNTRY = Object.fromEntries(`
AD:EUR AE:AED AF:AFN AG:XCD AI:XCD AL:ALL AM:AMD AO:AOA AR:ARS AS:USD AT:EUR AU:AUD AW:AWG AX:EUR AZ:AZN
BA:BAM BB:BBD BD:BDT BE:EUR BF:XOF BG:EUR BH:BHD BI:BIF BJ:XOF BL:EUR BM:BMD BN:BND BO:BOB BQ:USD BR:BRL
BS:BSD BT:BTN BW:BWP BY:BYN BZ:BZD CA:CAD CC:AUD CD:CDF CF:XAF CG:XAF CH:CHF CI:XOF CK:NZD CL:CLP CM:XAF
CN:CNY CO:COP CR:CRC CU:CUP CV:CVE CW:XCG CX:AUD CY:EUR CZ:CZK DE:EUR DJ:DJF DK:DKK DM:XCD DO:DOP DZ:DZD
EC:USD EE:EUR EG:EGP EH:MAD ER:ERN ES:EUR ET:ETB FI:EUR FJ:FJD FK:FKP FM:USD FO:DKK FR:EUR GA:XAF GB:GBP
GD:XCD GE:GEL GF:EUR GG:GBP GH:GHS GI:GIP GL:DKK GM:GMD GN:GNF GP:EUR GQ:XAF GR:EUR GT:GTQ GU:USD GW:XOF
GY:GYD HK:HKD HN:HNL HR:EUR HT:HTG HU:HUF ID:IDR IE:EUR IL:ILS IM:GBP IN:INR IO:USD IQ:IQD IR:IRR IS:ISK
IT:EUR JE:GBP JM:JMD JO:JOD JP:JPY KE:KES KG:KGS KH:KHR KI:AUD KM:KMF KN:XCD KP:KPW KR:KRW KW:KWD KY:KYD
KZ:KZT LA:LAK LB:LBP LC:XCD LI:CHF LK:LKR LR:LRD LS:LSL LT:EUR LU:EUR LV:EUR LY:LYD MA:MAD MC:EUR MD:MDL
ME:EUR MF:EUR MG:MGA MH:USD MK:MKD ML:XOF MM:MMK MN:MNT MO:MOP MP:USD MQ:EUR MR:MRU MS:XCD MT:EUR MU:MUR
MV:MVR MW:MWK MX:MXN MY:MYR MZ:MZN NA:NAD NC:XPF NE:XOF NF:AUD NG:NGN NI:NIO NL:EUR NO:NOK NP:NPR NR:AUD
NU:NZD NZ:NZD OM:OMR PA:PAB PE:PEN PF:XPF PG:PGK PH:PHP PK:PKR PL:PLN PM:EUR PN:NZD PR:USD PS:ILS PT:EUR
PW:USD PY:PYG QA:QAR RE:EUR RO:RON RS:RSD RU:RUB RW:RWF SA:SAR SB:SBD SC:SCR SD:SDG SE:SEK SG:SGD SH:SHP
SI:EUR SJ:NOK SK:EUR SL:SLE SM:EUR SN:XOF SO:SOS SR:SRD SS:SSP ST:STN SV:USD SX:XCG SY:SYP SZ:SZL TC:USD
TD:XAF TG:XOF TH:THB TJ:TJS TK:NZD TL:USD TM:TMT TN:TND TO:TOP TR:TRY TT:TTD TV:AUD TW:TWD TZ:TZS UA:UAH
UG:UGX US:USD UY:UYU UZ:UZS VA:EUR VC:XCD VE:VES VG:USD VI:USD VN:VND VU:VUV WF:XPF WS:WST XK:EUR YE:YER
YT:EUR ZA:ZAR ZM:ZMW ZW:ZWG`.trim().split(/\s+/).map(pair => pair.split(':')));

function detectCountry() {
  for (const tag of navigator.languages || [navigator.language]) {
    try {
      const region = new Intl.Locale(tag).maximize().region;
      if (CURRENCY_BY_COUNTRY[region]) return region;
    } catch { /* unparseable locale tag */ }
  }
  return 'US';
}

// Amounts are stored as integer cents to avoid floating-point drift.
function freshState() {
  const country = detectCountry();
  return { name: '', country, currency: CURRENCY_BY_COUNTRY[country], budget: 0, categories: DEFAULT_CATEGORIES.map(c => ({ ...c })), expenses: [] };
}

// Fills in missing fields and upgrades older saves: a currency symbol instead of a
// country, and per-category budgets instead of one monthly total.
function normalize(s) {
  const out = { ...freshState(), ...s };
  if (!CURRENCY_BY_COUNTRY[out.country]) out.country = detectCountry();
  out.currency = CURRENCY_BY_COUNTRY[out.country];
  if (typeof s.budget !== 'number') out.budget = out.categories.reduce((sum, c) => sum + (c.budget || 0), 0);
  out.categories = out.categories.map(({ budget, ...c }) => c);
  return out;
}

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && Array.isArray(s.categories) && Array.isArray(s.expenses)) return normalize(s);
  } catch { /* storage unavailable or corrupt: start fresh */ }
  return freshState();
}

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    toast('Could not save — browser storage is blocked or full');
  }
}

let state = load();
const ui = { tab: 'overview', period: 'month', anchor: toKey(new Date()), filter: null, lastCat: null };

/* ================= Helpers ================= */

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad(n) { return String(n).padStart(2, '0'); }
function toKey(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function fromKey(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function daysInMonth(d) { return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); }
function startOfWeek(d) { return addDays(d, -((d.getDay() + 6) % 7)); } // weeks start Monday

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${CAT_ICONS[name] || UI_ICONS[name] || CAT_ICONS.dots}</svg>`;
const sumOf = list => list.reduce((s, e) => s + e.amount, 0);
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

const formatters = {};
function formatter(code = state.currency) {
  if (!formatters[code]) {
    try {
      formatters[code] = new Intl.NumberFormat('en-US', { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol' });
    } catch {
      formatters[code] = new Intl.NumberFormat('en-US', { style: 'currency', currency: code });
    }
  }
  return formatters[code];
}
const currencySymbol = (code = state.currency) => formatter(code).formatToParts(0).find(p => p.type === 'currency')?.value || code;
const currencyDigits = () => formatter().resolvedOptions().maximumFractionDigits;
const moneyText = cents => formatter().format(cents / 100);

// Wraps the decimal part in .cents so it renders lighter, as in the reference design.
function money(cents) {
  const html = formatter().formatToParts(Math.abs(cents) / 100).map(p =>
    p.type === 'decimal' ? `<span class="cents">${esc(p.value)}`
    : p.type === 'fraction' ? `${esc(p.value)}</span>`
    : esc(p.value)).join('');
  return `<span class="money">${cents < 0 ? '−' : ''}${html}</span>`;
}

function flag(country) {
  const c = country.toLowerCase();
  return `<img class="flag" src="https://flagcdn.com/24x18/${c}.png" srcset="https://flagcdn.com/48x36/${c}.png 2x" width="24" height="18" alt="" loading="lazy">`;
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
const currencyNames = new Intl.DisplayNames(['en'], { type: 'currency' });
const countryName = code => regionNames.of(code) || code;

function time12(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${pad(((h + 11) % 12) + 1)}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`;
}

function dayHeading(key) {
  const today = toKey(new Date());
  if (key === today) return 'Today';
  if (key === toKey(addDays(new Date(), -1))) return 'Yesterday';
  const d = fromKey(key);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
}

// Olive gradient, darkest first — mirrors the stacked bands in the reference design.
function shade(i, n) {
  const a = [0x43, 0x4B, 0x40], b = [0x74, 0x7F, 0x6B];
  const t = n > 1 ? i / (n - 1) : 0;
  return '#' + a.map((v, k) => Math.round(v + (b[k] - v) * t).toString(16).padStart(2, '0')).join('');
}

function catById(id) {
  return state.categories.find(c => c.id === id) || { id, name: 'Uncategorized', icon: 'dots' };
}
function catColor(id) {
  const i = state.categories.findIndex(c => c.id === id);
  return shade(Math.max(i, 0), state.categories.length);
}

/* ================= Periods ================= */

function periodRange(period = ui.period, anchor = fromKey(ui.anchor)) {
  if (period === 'day') return { start: anchor, end: anchor };
  if (period === 'week') { const s = startOfWeek(anchor); return { start: s, end: addDays(s, 6) }; }
  return { start: new Date(anchor.getFullYear(), anchor.getMonth(), 1), end: new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0) };
}

function expensesIn({ start, end }) {
  const a = toKey(start), b = toKey(end);
  return state.expenses.filter(e => e.date >= a && e.date <= b);
}

function isCurrentPeriod() {
  return toKey(periodRange().start) === toKey(periodRange(ui.period, new Date()).start);
}

function periodLabel() {
  const { start, end } = periodRange();
  const mon = d => MONTHS[d.getMonth()].slice(0, 3);
  if (ui.period === 'day') return `${dayHeading(ui.anchor)}${ui.anchor.slice(0, 4) !== String(new Date().getFullYear()) ? ' ' + ui.anchor.slice(0, 4) : ''}`;
  if (ui.period === 'week') {
    return start.getMonth() === end.getMonth()
      ? `${start.getDate()} – ${end.getDate()} ${mon(end)}`
      : `${start.getDate()} ${mon(start)} – ${end.getDate()} ${mon(end)}`;
  }
  return `${MONTHS[start.getMonth()]} ${start.getFullYear()}`;
}

function periodNoun() {
  const current = isCurrentPeriod();
  if (ui.period === 'day') return current ? 'today' : 'this day';
  if (current) return `this ${ui.period}`;
  return ui.period === 'week' ? 'that week' : `in ${MONTHS[fromKey(ui.anchor).getMonth()]}`;
}

// The monthly budget prorated to the visible period.
function periodBudget() {
  if (ui.period === 'month') return state.budget;
  const days = ui.period === 'week' ? 7 : 1;
  return Math.round(state.budget * days / daysInMonth(fromKey(ui.anchor)));
}

function categoryBand(c, i, n, spent, count, total, action) {
  const share = total ? spent / total * 100 : 0;
  return `
    <button class="band ${spent ? '' : 'is-empty'}" style="--band:${shade(i, n)}" ${action}>
      <span class="band-icon">${icon(c.icon)}</span>
      <span class="band-body">
        <span class="row"><span class="band-name">${esc(c.name)}</span><span class="band-amount">${money(spent)}</span></span>
        <span class="row label"><span>${plural(count, 'expense')}</span><span>${Math.round(share)}% of spending</span></span>
        <span class="bar"><i style="width:${share}%"></i></span>
      </span>
    </button>`;
}

function shift(dir) {
  const a = fromKey(ui.anchor);
  let next;
  if (ui.period === 'day') next = addDays(a, dir);
  else if (ui.period === 'week') next = addDays(a, 7 * dir);
  else {
    const first = new Date(a.getFullYear(), a.getMonth() + dir, 1);
    next = new Date(first.getFullYear(), first.getMonth(), Math.min(a.getDate(), daysInMonth(first)));
  }
  ui.anchor = toKey(next);
  render();
}

/* ================= Views ================= */

function title(light, bold) {
  return `<h1 class="title"><span>${light}</span>${bold}</h1>`;
}

function periodControls() {
  const seg = ['day', 'week', 'month'].map(p =>
    `<button data-action="period" data-period="${p}" class="${ui.period === p ? 'is-active' : ''}">${p}</button>`).join('');
  return `
    <div class="period">
      <div class="seg" role="group" aria-label="Period">${seg}</div>
      <div>
        <div class="nav">
          <button class="icon-btn" data-action="shift" data-dir="-1" aria-label="Previous ${ui.period}">${icon('left')}</button>
          <span class="nav-label">${periodLabel()}</span>
          <button class="icon-btn" data-action="shift" data-dir="1" aria-label="Next ${ui.period}">${icon('right')}</button>
        </div>
        ${isCurrentPeriod() ? '' : `<div style="text-align:center"><button class="nav-today label" data-action="today">Back to today</button></div>`}
      </div>
      <button class="add-cta" data-action="add-expense"><span class="add-cta-icon">${icon('plus')}</span>Add expense</button>
    </div>`;
}

function renderOverview() {
  const list = expensesIn(periodRange());
  const total = sumOf(list);
  const budget = periodBudget();
  const left = budget - total;
  const over = left < 0;

  const byCat = {};
  list.forEach(e => {
    byCat[e.categoryId] ??= { total: 0, count: 0 };
    byCat[e.categoryId].total += e.amount;
    byCat[e.categoryId].count++;
  });
  const known = new Set(state.categories.map(c => c.id));
  const cats = [...state.categories, ...Object.keys(byCat).filter(id => !known.has(id)).map(catById)]
    .sort((a, b) => (byCat[b.id]?.total || 0) - (byCat[a.id]?.total || 0));

  const bands = cats.map((c, i) => categoryBand(c, i, cats.length, byCat[c.id]?.total || 0, byCat[c.id]?.count || 0, total,
    `data-action="filter" data-cat="${esc(c.id)}"`)).join('');

  const intro = state.expenses.length ? '' : `
    <div class="empty-card">
      <p>No expenses yet. Tap <strong>Add expense</strong> above to log your first one — or explore with some example data.</p>
      <button class="btn" data-action="sample">${icon('sparkle')} Load sample data</button>
    </div>`;

  return `
    ${title('Your', 'Spending')}
    ${periodControls()}
    <section class="summary">
      <div class="row label"><span>Spent ${periodNoun()}</span><span>${plural(list.length, 'expense')}</span></div>
      <div class="summary-amount">${money(total)}</div>
      <div class="meter"><i class="${over ? 'over' : ''}" style="width:${budget ? Math.min(100, total / budget * 100) : 0}%"></i></div>
      <div class="row label">${budget
        ? `<button class="link-btn label" data-action="edit-budget">Budget ${money(budget)}</button><span class="${over ? 'over-text' : ''}">${over ? 'Over' : 'Left'} ${money(Math.abs(left))}</span>`
        : `<button class="link-btn label" data-action="edit-budget">+ Set a monthly budget</button>`}</div>
    </section>
    ${renderChart()}
    ${intro}
    <div class="section-head row"><span class="label">By category</span><span class="label muted">Tap to see expenses</span></div>
    <div>${bands}</div>
    <button class="show-more" data-action="tab" data-tab="transactions">Show all transactions</button>`;
}

function renderChart() {
  const a = fromKey(ui.anchor);
  const days = ui.period === 'month'
    ? Array.from({ length: daysInMonth(a) }, (_, i) => new Date(a.getFullYear(), a.getMonth(), i + 1))
    : Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(a), i));

  const totals = {};
  state.expenses.forEach(e => { totals[e.date] = (totals[e.date] || 0) + e.amount; });

  const dailyBudget = Math.round(state.budget / daysInMonth(a));
  const data = days.map(d => ({ key: toKey(d), d, total: totals[toKey(d)] || 0 }));
  const max = Math.max(dailyBudget, ...data.map(x => x.total), 1);
  const today = toKey(new Date());
  const hiKey = ui.period === 'day' ? ui.anchor : today;
  const spentDays = data.filter(x => x.key <= today);
  const avg = spentDays.length ? Math.round(sumOf(spentDays.map(x => ({ amount: x.total }))) / spentDays.length) : 0;

  const cols = data.map(x => `
    <button class="chart-col ${x.total ? '' : 'is-zero'} ${x.key === hiKey ? 'is-hi' : ''}" data-action="day" data-day="${x.key}"
      title="${dayHeading(x.key)}: ${esc(moneyText(x.total))}" aria-label="${dayHeading(x.key)}">
      <i style="height:${x.total / max * 100}%"></i>
    </button>`).join('');
  const axis = data.map((x, i) => {
    const text = ui.period === 'month' ? ((i + 1) % 5 === 0 || i === 0 ? x.d.getDate() : '') : WEEKDAYS[x.d.getDay()].charAt(0);
    return `<span class="${x.key === hiKey ? 'is-hi' : ''}">${text}</span>`;
  }).join('');

  return `
    <section class="chart">
      <div class="row">
        <span class="label">Daily · avg ${money(avg)}</span>
        ${dailyBudget ? `<span class="label muted legend">Daily budget ${money(dailyBudget)}</span>` : ''}
      </div>
      <div class="chart-plot">
        ${dailyBudget ? `<div class="chart-line" style="bottom:${dailyBudget / max * 100}%"></div>` : ''}
        ${cols}
      </div>
      <div class="chart-axis">${axis}</div>
    </section>`;
}

function txnRow(e) {
  const c = catById(e.categoryId);
  return `
    <button class="txn" data-action="edit-expense" data-id="${esc(e.id)}">
      <span class="txn-icon" style="--band:${catColor(c.id)}">${icon(c.icon)}</span>
      <span class="txn-main">
        <span class="txn-name">${esc(e.note || c.name)}</span>
        <span class="label muted">${esc(c.name)}</span>
      </span>
      <span class="txn-side">${money(e.amount)}<span class="label muted">${time12(e.time)}</span></span>
    </button>`;
}

function renderTransactions() {
  let list = expensesIn(periodRange());
  if (ui.filter) list = list.filter(e => e.categoryId === ui.filter);
  list.sort((a, b) => (b.date + (b.time || '')).localeCompare(a.date + (a.time || '')));

  const groups = [];
  list.forEach(e => {
    const last = groups[groups.length - 1];
    if (last && last.date === e.date) last.items.push(e);
    else groups.push({ date: e.date, items: [e] });
  });

  const chips = [{ id: null, name: 'All' }, ...state.categories].map(c =>
    `<button class="chip ${ui.filter === c.id ? 'is-active' : ''}" data-action="chip" data-cat="${c.id ? esc(c.id) : ''}">${esc(c.name)}</button>`).join('');

  const body = groups.length
    ? groups.map(g => `
        ${ui.period === 'day' ? '' : `<button class="day-head" data-action="day" data-day="${g.date}"><span class="label">${dayHeading(g.date)}</span><span class="label">${money(sumOf(g.items))}</span></button>`}
        ${g.items.map(txnRow).join('')}`).join('')
    : `<div class="empty"><p>Nothing logged ${ui.filter ? `in ${esc(catById(ui.filter).name)} ` : ''}${periodNoun()}.</p>
         <button class="btn" data-action="add-expense">${icon('plus')} Add expense</button></div>`;

  return `
    ${title('All Recent', 'Transactions')}
    ${periodControls()}
    <div class="chips">${chips}</div>
    ${list.length ? `<div class="list-head row"><span class="label muted">${plural(list.length, 'transaction')}</span><span class="label">Total ${money(sumOf(list))}</span></div>` : ''}
    ${body}`;
}

function renderBudgets() {
  const list = expensesIn(periodRange('month', new Date()));
  const spent = sumOf(list);
  const left = state.budget - spent;
  const mon = MONTHS[new Date().getMonth()].slice(0, 3);
  const by = {};
  list.forEach(e => {
    by[e.categoryId] ??= { total: 0, count: 0 };
    by[e.categoryId].total += e.amount;
    by[e.categoryId].count++;
  });
  const n = state.categories.length;
  const bands = state.categories.map((c, i) => categoryBand(c, i, n, by[c.id]?.total || 0, by[c.id]?.count || 0, spent,
    `data-action="edit-category" data-id="${esc(c.id)}"`)).join('');

  return `
    ${title('Your monthly', 'Budget')}
    <button class="add-block" data-action="edit-budget">
      <span class="row label"><span>Monthly budget</span><span>Tap to ${state.budget ? 'edit' : 'set'}</span></span>
      <span class="summary-amount">${state.budget ? money(state.budget) : 'Not set'}</span>
      <span class="meter"><i class="${left < 0 ? 'over' : ''}" style="width:${state.budget ? Math.min(100, spent / state.budget * 100) : 0}%"></i></span>
      <span class="row label"><span>Spent in ${mon} ${money(spent)}</span>${state.budget
        ? `<span class="${left < 0 ? 'over-text' : ''}">${left < 0 ? 'Over' : 'Left'} ${money(Math.abs(left))}</span>` : ''}</span>
    </button>
    <div class="section-head row"><span class="label">Categories</span><span class="label muted">Spent in ${mon} · tap to edit</span></div>
    <div>${bands}</div>
    <button class="show-more" data-action="add-category">+ New category</button>`;
}

function render() {
  const views = { overview: renderOverview, transactions: renderTransactions, budgets: renderBudgets };
  document.getElementById('view').innerHTML = views[ui.tab]();
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('is-active', t.dataset.tab === ui.tab));

  const initials = state.name.trim().split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  document.getElementById('avatar').innerHTML = initials ? esc(initials) : icon('user');
}

/* ================= Sheets ================= */

const sheetEl = document.getElementById('sheet');
const backdropEl = document.getElementById('backdrop');
let sheetTimer;

function openSheet(heading, html, mount) {
  clearTimeout(sheetTimer);
  sheetEl.innerHTML = `
    <div class="sheet-head"><h2>${heading}</h2>
      <button class="icon-btn" data-action="close-sheet" aria-label="Close">${icon('close')}</button></div>
    ${html}`;
  sheetEl.setAttribute('aria-label', heading);
  sheetEl.hidden = backdropEl.hidden = false;
  void sheetEl.offsetHeight; // restart the slide-in transition
  sheetEl.classList.add('open');
  backdropEl.classList.add('open');
  document.body.classList.add('locked');
  mount?.(sheetEl);
}

function closeSheet() {
  sheetEl.classList.remove('open');
  backdropEl.classList.remove('open');
  document.body.classList.remove('locked');
  sheetTimer = setTimeout(() => { sheetEl.hidden = backdropEl.hidden = true; sheetEl.innerHTML = ''; }, 220);
}

function openExpenseSheet(id) {
  const ex = id ? state.expenses.find(e => e.id === id) : null;
  const now = new Date();
  const defaultCat = ex?.categoryId || ui.filter || ui.lastCat || state.categories[0]?.id;

  const tiles = state.categories.map(c => `
    <label class="pick" style="--band:${catColor(c.id)}">
      <input type="radio" name="cat" value="${esc(c.id)}" ${c.id === defaultCat ? 'checked' : ''} required>
      ${icon(c.icon)}<span>${esc(c.name)}</span>
    </label>`).join('');

  openSheet(ex ? 'Edit expense' : 'New expense', `
    <form id="expense-form" novalidate>
      <label class="amount-field" aria-label="Amount">
        <span class="cur">${esc(currencySymbol())}</span>
        <input name="amount" inputmode="decimal" placeholder="${(0).toFixed(currencyDigits())}" autocomplete="off">
      </label>
      <div class="field"><span class="label">Category</span><div class="pick-grid">${tiles}</div></div>
      <label class="field"><span class="label">Note</span><input name="note" maxlength="60" placeholder="e.g. Ramen with friends"></label>
      <div class="field-row">
        <label class="field"><span class="label">Date</span><input type="date" name="date" required></label>
        <label class="field"><span class="label">Time</span><input type="time" name="time"></label>
      </div>
      <button class="btn btn-primary" type="submit">${ex ? 'Save changes' : 'Add expense'}</button>
      ${ex ? `<button class="btn btn-danger" type="button" id="delete-expense">${icon('trash')} Delete expense</button>` : ''}
    </form>`, root => {
    const form = root.querySelector('#expense-form');
    const f = form.elements;
    f.amount.value = ex ? (ex.amount / 100).toFixed(currencyDigits()) : '';
    f.note.value = ex?.note || '';
    f.date.value = ex?.date || (ui.period === 'day' ? ui.anchor : toKey(now));
    f.time.value = ex ? ex.time || '' : `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    if (!ex) setTimeout(() => f.amount.focus(), 250);

    form.addEventListener('submit', ev => {
      ev.preventDefault();
      const amount = Math.round(parseFloat(f.amount.value.replace(/[^0-9.]/g, '')) * 100);
      if (!(amount > 0)) { toast('Enter an amount'); f.amount.focus(); return; }
      if (!f.date.value) { toast('Pick a date'); f.date.focus(); return; }
      const data = {
        amount,
        categoryId: new FormData(form).get('cat') || defaultCat,
        note: f.note.value.trim(),
        date: f.date.value,
        time: f.time.value,
      };
      const id = ex?.id || uid();
      if (ex) Object.assign(ex, data);
      else state.expenses.push({ id, ...data });
      queue('PUT', `/api/expenses/${encodeURIComponent(id)}`, data);
      ui.lastCat = data.categoryId;
      save(); closeSheet(); render();
      toast(ex ? 'Expense updated' : `Added ${moneyText(amount)} to ${catById(data.categoryId).name}`);
    });

    root.querySelector('#delete-expense')?.addEventListener('click', () => {
      if (!confirm('Delete this expense?')) return;
      state.expenses = state.expenses.filter(e => e.id !== ex.id);
      queue('DELETE', `/api/expenses/${encodeURIComponent(ex.id)}`);
      save(); closeSheet(); render(); toast('Expense deleted');
    });
  });
}

function openCategorySheet(id) {
  const cat = id ? state.categories.find(c => c.id === id) : null;
  const chosen = cat?.icon || 'dots';
  const icons = Object.keys(CAT_ICONS).map(k => `
    <label class="pick" aria-label="${k}"><input type="radio" name="icon" value="${k}" ${k === chosen ? 'checked' : ''}>${icon(k)}</label>`).join('');

  openSheet(cat ? 'Edit category' : 'New category', `
    <form id="cat-form" novalidate>
      <label class="field"><span class="label">Name</span><input name="name" maxlength="28" placeholder="e.g. Coffee" required></label>
      <div class="field"><span class="label">Icon</span><div class="pick-grid icons">${icons}</div></div>
      <button class="btn btn-primary" type="submit">${cat ? 'Save changes' : 'Add category'}</button>
      ${cat ? `<button class="btn btn-danger" type="button" id="delete-cat">${icon('trash')} Delete category</button>` : ''}
    </form>`, root => {
    const form = root.querySelector('#cat-form');
    const f = form.elements;
    f.name.value = cat?.name || '';

    form.addEventListener('submit', ev => {
      ev.preventDefault();
      const name = f.name.value.trim();
      if (!name) { toast('Give the category a name'); f.name.focus(); return; }
      const data = { name, icon: new FormData(form).get('icon') || 'dots' };
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'category';
      const id = cat?.id || `${slug}-${uid().slice(-4)}`;
      if (cat) Object.assign(cat, data);
      else state.categories.push({ id, ...data });
      queue('PUT', `/api/categories/${encodeURIComponent(id)}`, { ...data, position: state.categories.findIndex(c => c.id === id) });
      save(); closeSheet(); render(); toast(cat ? 'Category updated' : 'Category added');
    });

    root.querySelector('#delete-cat')?.addEventListener('click', () => {
      if (state.categories.length === 1) { toast('Keep at least one category'); return; }
      const rest = state.categories.filter(c => c.id !== cat.id);
      const fallback = rest.find(c => c.id === 'other') || rest[0];
      const used = state.expenses.filter(e => e.categoryId === cat.id).length;
      const msg = used
        ? `Delete "${cat.name}"? Its ${plural(used, 'expense')} will move to "${fallback.name}".`
        : `Delete "${cat.name}"?`;
      if (!confirm(msg)) return;
      state.expenses.forEach(e => { if (e.categoryId === cat.id) e.categoryId = fallback.id; });
      state.categories = rest;
      queue('DELETE', `/api/categories/${encodeURIComponent(cat.id)}?moveTo=${encodeURIComponent(fallback.id)}`);
      if (ui.filter === cat.id) ui.filter = null;
      save(); closeSheet(); render(); toast('Category deleted');
    });
  });
}

function openBudgetSheet() {
  openSheet('Monthly budget', `
    <form id="budget-form" novalidate>
      <p class="sheet-note muted">One budget for all your spending. Week and day views show their share of it.</p>
      <label class="amount-field" aria-label="Monthly budget">
        <span class="cur">${esc(currencySymbol())}</span>
        <input name="budget" inputmode="decimal" placeholder="${(0).toFixed(currencyDigits())}" autocomplete="off">
      </label>
      <button class="btn btn-primary" type="submit">Save budget</button>
    </form>`, root => {
    const form = root.querySelector('#budget-form');
    const input = form.elements.budget;
    input.value = state.budget ? (state.budget / 100).toFixed(currencyDigits()) : '';
    setTimeout(() => input.focus(), 250);

    form.addEventListener('submit', ev => {
      ev.preventDefault();
      state.budget = Math.max(0, Math.round((parseFloat(input.value.replace(/[^0-9.]/g, '')) || 0) * 100));
      queue('PUT', '/api/settings', { budget: state.budget });
      save(); closeSheet(); render();
      toast(state.budget ? `Monthly budget set to ${moneyText(state.budget)}` : 'Budget cleared');
    });
  });
}

function openMenuSheet() {
  openSheet('Settings', `
    <div class="stack">
      <label class="field"><span class="label">Your name</span><input id="set-name" maxlength="40" placeholder="Optional"></label>
      <div class="field">
        <span class="label">Country &amp; currency</span>
        <button class="country-btn" id="pick-country">
          ${flag(state.country)}
          <span class="country-name">${esc(countryName(state.country))}</span>
          <span class="label muted">${state.currency} · ${esc(currencySymbol())}</span>
          ${icon('right')}
        </button>
      </div>
      <div class="menu-group">
        <span class="label muted">${sync.mode === 'server' ? 'Saved to your budget database' : 'Your data stays in this browser'}</span>
        <button class="btn btn-block" id="export-csv">${icon('download')} Export expenses (CSV)</button>
        <button class="btn btn-block" id="backup">${icon('download')} Back up everything (JSON)</button>
        <label class="btn btn-block file-btn">${icon('upload')} Restore from backup<input type="file" id="restore" accept="application/json,.json"></label>
        <button class="btn btn-block" data-action="sample">${icon('sparkle')} Add sample data</button>
        <button class="btn btn-block btn-danger" id="erase">${icon('trash')} Erase all data</button>
      </div>
    </div>`, root => {
    const name = root.querySelector('#set-name');
    name.value = state.name;
    name.addEventListener('input', () => {
      state.name = name.value;
      queue('PUT', '/api/settings', { name: state.name });
      save(); render();
    });
    root.querySelector('#pick-country').addEventListener('click', openCountrySheet);

    root.querySelector('#export-csv').addEventListener('click', exportCsv);
    root.querySelector('#backup').addEventListener('click', () =>
      download(`budget-backup-${toKey(new Date())}.json`, JSON.stringify(state, null, 2), 'application/json'));
    root.querySelector('#restore').addEventListener('change', ev => restore(ev.target.files[0]));
    root.querySelector('#erase').addEventListener('click', () => {
      if (!confirm('Erase all expenses and categories? This cannot be undone — consider backing up first.')) return;
      state = freshState(); ui.filter = null;
      queue('PUT', '/api/state', snapshot());
      save(); closeSheet(); render(); toast('All data erased');
    });
  });
}

function openCountrySheet() {
  const countries = Object.keys(CURRENCY_BY_COUNTRY)
    .map(code => ({ code, name: countryName(code), currency: CURRENCY_BY_COUNTRY[code] }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const rows = countries.map(c => {
    const search = `${c.name} ${c.code} ${c.currency} ${currencyNames.of(c.currency) || ''}`.toLowerCase();
    return `
      <button class="country-row ${c.code === state.country ? 'is-active' : ''}" data-code="${c.code}" data-search="${esc(search)}">
        ${flag(c.code)}
        <span class="country-name">${esc(c.name)}</span>
        <span class="label muted">${c.currency} · ${esc(currencySymbol(c.currency))}</span>
      </button>`;
  }).join('');

  openSheet('Country & currency', `
    <div class="country-search"><input id="country-search" type="search" placeholder="Search country or currency" autocomplete="off" aria-label="Search countries"></div>
    <div class="country-list" id="country-list">${rows}</div>
    <p class="empty muted" id="country-none" hidden>No matching country</p>`, root => {
    const input = root.querySelector('#country-search');
    const list = root.querySelector('#country-list');
    const none = root.querySelector('#country-none');
    setTimeout(() => {
      list.querySelector('.is-active')?.scrollIntoView({ block: 'center' });
      input.focus();
    }, 250);

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      let shown = 0;
      list.querySelectorAll('.country-row').forEach(row => {
        const match = row.dataset.search.includes(q);
        row.hidden = !match;
        shown += match;
      });
      none.hidden = shown > 0;
    });

    list.addEventListener('click', ev => {
      const row = ev.target.closest('.country-row');
      if (!row) return;
      state.country = row.dataset.code;
      state.currency = CURRENCY_BY_COUNTRY[state.country];
      queue('PUT', '/api/settings', { country: state.country });
      save(); render();
      toast(`Currency set to ${state.currency} (${currencySymbol()})`);
      openMenuSheet();
    });
  });
}

/* ================= Import / export ================= */

function download(filename, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportCsv() {
  const q = v => `"${String(v).replace(/"/g, '""')}"`;
  const rows = [...state.expenses]
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .map(e => [e.date, e.time, catById(e.categoryId).name, e.note, (e.amount / 100).toFixed(2)].map(q).join(','));
  download(`expenses-${toKey(new Date())}.csv`, ['Date,Time,Category,Note,Amount', ...rows].join('\n'), 'text/csv');
}

function restore(file) {
  if (!file) return;
  file.text().then(text => {
    const data = JSON.parse(text);
    if (!Array.isArray(data.categories) || !Array.isArray(data.expenses)) throw new Error('bad shape');
    if (!confirm(`Replace current data with this backup (${plural(data.expenses.length, 'expense')})?`)) return;
    state = normalize(data);
    ui.filter = null;
    queue('PUT', '/api/state', snapshot());
    save(); closeSheet(); render(); toast('Backup restored');
  }).catch(() => toast('That file is not a valid backup'));
}

/* ================= Sample data ================= */

function loadSample() {
  if (state.expenses.length && !confirm('Add about two months of example expenses to your data?')) return;
  const SAMPLES = {
    'eating-out': [['Burger joint', 1450], ['Sushi dinner', 3800], ['Coffee & croissant', 650], ['Pizza night', 2200], ['Lunch takeaway', 1180]],
    groceries: [['Weekly shop', 8400], ['Fruit & veg', 1900], ['Corner store', 720], ['Bakery', 540]],
    transport: [['Metro top-up', 2500], ['Taxi home', 1640], ['Fuel', 4500], ['Bus fare', 280]],
    entertainment: [['Cinema', 1400], ['Concert tickets', 6500], ['Bowling', 2000], ['Video game', 3999]],
    shopping: [['Sneakers', 8900], ['T-shirt', 2400], ['Phone case', 1500]],
    health: [['Pharmacy', 1350], ['Vitamins', 2100]],
    other: [['Birthday gift', 3000], ['Laundry', 800]],
  };
  const MONTHLY = [['subscriptions', 3, 'Music streaming', 1199], ['subscriptions', 12, 'Video streaming', 1549], ['subscriptions', 20, 'Cloud storage', 299], ['grooming', 6, 'Haircut', 3000], ['grooming', 21, 'Beard trim', 1500]];
  const has = id => state.categories.some(c => c.id === id);

  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pick = arr => arr[Math.floor(rand() * arr.length)];
  const weights = ['eating-out', 'eating-out', 'eating-out', 'groceries', 'groceries', 'transport', 'transport', 'entertainment', 'shopping', 'health', 'other'];

  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const d = addDays(today, -i);
    const date = toKey(d);
    const n = Math.floor(rand() * 3);
    for (let j = 0; j < n; j++) {
      const cat = pick(weights);
      if (!has(cat)) continue;
      const [note, base] = pick(SAMPLES[cat]);
      const amount = Math.round(base * (0.8 + rand() * 0.4));
      const time = `${pad(8 + Math.floor(rand() * 14))}:${pad(Math.floor(rand() * 60))}`;
      state.expenses.push({ id: uid() + j, amount, categoryId: cat, note, date, time });
    }
    MONTHLY.forEach(([cat, day, note, amount]) => {
      if (d.getDate() === day && has(cat)) state.expenses.push({ id: uid() + day, amount, categoryId: cat, note, date, time: '09:00' });
    });
  }
  if (!state.budget) state.budget = 130000;
  queue('PUT', '/api/state', snapshot());
  save(); closeSheet(); render(); toast('Sample data added');
}

/* ================= Server sync ================= */

// Served by server.js, every change is saved locally first and then sent to the
// SQLite database through an outbox, so expenses added offline upload once the phone
// reconnects. Opened any other way (a file, Live Server) the app uses browser storage alone.
const OUTBOX_KEY = 'budget-tracker-outbox';
const META_KEY = 'budget-tracker-sync';

function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function writeJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage blocked */ }
}

const sync = {
  mode: 'local',                      // 'local' | 'server'
  status: 'local',                    // 'local' | 'synced' | 'saving' | 'offline' | 'locked'
  outbox: readJson(OUTBOX_KEY, []),   // [{ method, path, body }], oldest first
  meta: readJson(META_KEY, {}),       // { server, linked, passcode }
  flushing: false,
};

function setStatus(status) {
  sync.status = status;
  renderStatus();
}

function renderStatus() {
  const el = document.getElementById('sync');
  const pending = sync.outbox.length;
  el.textContent = {
    local: 'This device only',
    synced: 'Synced',
    saving: 'Saving…',
    offline: pending ? `Offline · ${pending} to sync` : 'Offline',
    locked: 'Locked · tap to unlock',
  }[sync.status];
  el.dataset.status = sync.status;
}

function snapshot() {
  const { name, country, budget, categories, expenses } = state;
  return { name, country, budget, categories: categories.map(({ id, name, icon }) => ({ id, name, icon })), expenses };
}

function api(method, path, body) {
  return fetch(path, {
    method,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sync.meta.passcode || ''}` },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function queue(method, path, body) {
  if (sync.mode !== 'server') return;
  const last = sync.outbox[sync.outbox.length - 1];
  // Fold rapid edits to the same record (e.g. typing a name) into one request,
  // unless that request is already on its way.
  if (last && last.method === method && last.path === path && (sync.outbox.length > 1 || !sync.flushing)) {
    last.body = body && last.body ? { ...last.body, ...body } : body;
  } else {
    sync.outbox.push({ method, path, body });
  }
  writeJson(OUTBOX_KEY, sync.outbox);
  flush();
}

async function flush() {
  if (sync.mode !== 'server' || sync.flushing || sync.status === 'locked') return;
  sync.flushing = true;
  let rejected = false;
  try {
    while (sync.outbox.length) {
      setStatus('saving');
      const op = sync.outbox[0];
      let res;
      try {
        res = await api(op.method, op.path, op.body);
      } catch {
        setStatus('offline');
        return;
      }
      if (res.status === 401) { lock(); return; }
      if (res.status === 429 || res.status >= 500) { setStatus('offline'); return; }
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}));
        toast(`The server rejected a change: ${error || res.status}`);
        rejected = true;
      }
      sync.outbox.shift();
      writeJson(OUTBOX_KEY, sync.outbox);
    }
    setStatus('synced');
  } finally {
    sync.flushing = false;
  }
  if (rejected) pull(); // re-align this device with what the database actually holds
}

// Union by id, preferring the server's copy; used once when a browser first links up.
function mergeStates(remote, local) {
  const union = (a, b) => {
    const ids = new Set(a.map(x => x.id));
    return [...a, ...b.filter(x => !ids.has(x.id))];
  };
  return {
    name: remote.name || local.name,
    country: remote.country || local.country,
    budget: remote.budget || local.budget,
    categories: union(remote.categories, local.categories),
    expenses: union(remote.expenses, local.expenses),
  };
}

async function pull() {
  if (sync.mode !== 'server' || sync.status === 'locked') return;
  await flush();
  // Never overwrite changes that haven't reached the server, or a form being filled in.
  if (sync.outbox.length || !sheetEl.hidden) return;

  let res;
  try {
    res = await api('GET', '/api/state');
  } catch {
    setStatus('offline');
    return;
  }
  if (res.status === 401) return lock();
  if (!res.ok) { setStatus('offline'); return; }
  const remote = await res.json();
  if (sync.outbox.length || !sheetEl.hidden) return;

  if (!sync.meta.linked) {
    sync.meta.linked = true;
    writeJson(META_KEY, sync.meta);
    const merged = mergeStates(remote, state);
    if (merged.expenses.length > remote.expenses.length || merged.categories.length > remote.categories.length) {
      state = normalize(merged);
      save(); render();
      queue('PUT', '/api/state', snapshot());
      toast('Uploaded this device’s expenses to your database');
      return;
    }
  }

  state = normalize({ ...remote, country: remote.country || state.country });
  if (!remote.country) queue('PUT', '/api/settings', { country: state.country });
  save(); render();
  if (!sync.outbox.length) setStatus('synced');
}

function lock() {
  setStatus('locked');
  askPasscode();
}

function askPasscode() {
  if (document.getElementById('pass-form')) return;
  openSheet('Unlock your budget', `
    <form id="pass-form" novalidate>
      <p class="sheet-note muted">Enter the passcode shown in the server window when you started it (also saved in <strong>data/passcode.txt</strong>). Each device only asks once.</p>
      <label class="field"><span class="label">Passcode</span><input name="code" type="password" autocomplete="current-password" required></label>
      <button class="btn btn-primary" type="submit">Unlock</button>
    </form>`, root => {
    const form = root.querySelector('#pass-form');
    const input = form.elements.code;
    setTimeout(() => input.focus(), 250);

    form.addEventListener('submit', async ev => {
      ev.preventDefault();
      const code = input.value.trim();
      if (!code) { input.focus(); return; }
      sync.meta.passcode = code;
      let res;
      try {
        res = await api('GET', '/api/state');
      } catch {
        toast('Can’t reach the server — is it running?');
        return;
      }
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}));
        sync.meta.passcode = '';
        input.value = '';
        input.focus();
        toast(error || 'Could not unlock');
        return;
      }
      writeJson(META_KEY, sync.meta);
      setStatus(sync.outbox.length ? 'offline' : 'synced');
      closeSheet();
      setTimeout(pull, 260); // pull() waits until no sheet is open
    });
  });
}

async function initSync() {
  if (location.protocol === 'file:') return renderStatus();
  try {
    const res = await fetch('/api/health', { cache: 'no-store' });
    const info = res.ok ? await res.json().catch(() => ({})) : {};
    sync.meta.server = info.app === 'budget-tracker';
    writeJson(META_KEY, sync.meta);
  } catch { /* offline: trust what we learned last time */ }
  if (!sync.meta.server) return renderStatus();

  sync.mode = 'server';
  setStatus(sync.outbox.length ? 'offline' : 'synced');
  if ('serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('/sw.js').catch(() => {});

  window.addEventListener('online', pull);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') pull(); });
  setInterval(() => { if (sync.outbox.length) flush(); }, 30000);

  if (!sync.meta.passcode) lock();
  else pull();
}

function onStatusClick() {
  if (sync.status === 'locked') return askPasscode();
  if (sync.mode === 'local') return toast('Start the server (npm start) to save to your database');
  toast(sync.outbox.length ? 'Trying to sync…' : 'Everything is saved to your database');
  pull();
}

/* ================= Events ================= */

document.addEventListener('click', ev => {
  const el = ev.target.closest('[data-action]');
  if (!el) return;
  const { action } = el.dataset;
  const top = () => window.scrollTo({ top: 0 });

  switch (action) {
    case 'tab': ui.tab = el.dataset.tab; render(); top(); break;
    case 'period': ui.period = el.dataset.period; render(); break;
    case 'shift': shift(Number(el.dataset.dir)); break;
    case 'today': ui.anchor = toKey(new Date()); render(); break;
    case 'day': ui.period = 'day'; ui.anchor = el.dataset.day; render(); break;
    case 'filter': ui.filter = el.dataset.cat; ui.tab = 'transactions'; render(); top(); break;
    case 'chip': ui.filter = el.dataset.cat || null; render(); break;
    case 'add-expense': openExpenseSheet(); break;
    case 'edit-expense': openExpenseSheet(el.dataset.id); break;
    case 'edit-budget': openBudgetSheet(); break;
    case 'add-category': openCategorySheet(); break;
    case 'edit-category': openCategorySheet(el.dataset.id); break;
    case 'menu': openMenuSheet(); break;
    case 'close-sheet': closeSheet(); break;
    case 'sample': loadSample(); break;
    case 'sync-status': onStatusClick(); break;
  }
});

document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape' && !sheetEl.hidden) closeSheet();
});

let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

render();
initSync();
