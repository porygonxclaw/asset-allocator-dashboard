import {writeFile} from 'node:fs/promises';
import vm from 'node:vm';

const SOURCE_URL = process.env.CARDLADDER_ARCHIVE_URL ?? 'https://web.archive.org/web/20260219040604/https://www.cardladder.com/indexes/pokemon';
const OUTPUT_FILE = new URL('../src/data/cardladder-pokemon-index.json', import.meta.url);

function parseDate(date) {
  const [month, day, year] = date.split('/').map(Number);
  return Date.UTC(year, month - 1, day);
}

function sortSeries(map) {
  return Object.entries(map)
    .map(([date, value]) => ({date, ts: parseDate(date), value: Number(value)}))
    .filter((row) => Number.isFinite(row.ts) && Number.isFinite(row.value))
    .sort((a, b) => a.ts - b.ts);
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`fetch failed ${response.status} for ${url}`);
  }

  return response.text();
}

function evaluateNuxt(html) {
  const start = html.indexOf('window.__NUXT__=');
  if (start < 0) {
    throw new Error('could not locate window.__NUXT__ payload');
  }

  const end = html.indexOf('</script>', start);
  if (end < 0) {
    throw new Error('could not locate script terminator');
  }

  const code = html.slice(start, end).replace('window.__NUXT__=', 'window.__NUXT__ = ');
  const sandbox = {
    window: {},
    Date,
    Math,
    JSON,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    Error,
    parseInt,
    parseFloat,
    encodeURIComponent,
    decodeURIComponent,
    setTimeout,
    clearTimeout,
  };

  vm.runInNewContext(code, sandbox, {timeout: 10000});
  return sandbox.window.__NUXT__;
}

const html = await fetchHtml(SOURCE_URL);
const nuxt = evaluateNuxt(html);
const index = nuxt?.data?.[0]?.index;
if (!index) {
  throw new Error('could not locate Card Ladder index payload');
}

const fullSeries = sortSeries(index.dailyIndexTotal ?? {});
const fullSalesSeries = sortSeries(index.dailySalesTotal ?? {});
const recentCutoff = fullSeries.at(-1)?.ts ? new Date(fullSeries.at(-1).ts) : null;
if (recentCutoff) recentCutoff.setUTCFullYear(recentCutoff.getUTCFullYear() - 10);
const cutoffTs = recentCutoff?.getTime() ?? 0;
const recentSeries = fullSeries.filter((row) => row.ts >= cutoffTs).map(({date, value}) => ({date, value}));
const recentSalesSeries = fullSalesSeries.filter((row) => row.ts >= cutoffTs).map(({date, value}) => ({date, value}));

const payload = {
  sourceUrl: SOURCE_URL,
  fetchedAt: new Date().toISOString(),
  title: nuxt?.data?.[0]?.label ?? 'Pokemon',
  summary: {
    currentValue: index.dailyIndex,
    startingValue: fullSeries[0]?.value ?? index.dailyIndex,
    highValue: Math.max(...fullSeries.map((row) => row.value)),
    lowValue: Math.min(...fullSeries.map((row) => row.value)),
    averageValue: Number((fullSeries.reduce((sum, row) => sum + row.value, 0) / fullSeries.length).toFixed(2)),
    totalCards: index.totalCards,
    totalValue: index.totalValue,
    weeklyPercentChange: index.weeklyPercentChange,
    monthlyPercentChange: index.monthlyPercentChange,
    quarterlyPercentChange: index.quarterlyPercentChange,
    halfAnnualPercentChange: index.halfAnnualPercentChange,
    yearToDatePercentChange: index.yearToDatePercentChange,
    annualPercentChange: index.annualPercentChange,
    fiveYearPercentChange: index.fiveYearPercentChange,
  },
  fullSeries: fullSeries.map(({date, value}) => ({date, value})),
  recentSeries,
  fullSalesSeries: fullSalesSeries.map(({date, value}) => ({date, value})),
  recentSalesSeries,
};

await writeFile(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`wrote ${OUTPUT_FILE.pathname}`);
