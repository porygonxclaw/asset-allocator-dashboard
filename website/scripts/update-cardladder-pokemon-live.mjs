import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = resolve(__dirname, '../src/data/cardladder-pokemon-index.json');
const CARDLADDER_URL = process.env.CARDLADDER_URL ?? 'https://app.cardladder.com/indexes/pokemon';

function runAppleScript(script) {
  return execFileSync('/usr/bin/osascript', ['-e', script], {encoding: 'utf8'}).trim();
}

function jsExtractor() {
  return `(() => {
    const nuxt = window.__NUXT__;
    const index = nuxt && nuxt.data && nuxt.data[0] && nuxt.data[0].index;
    if (!index) return JSON.stringify({error: 'missing index payload'});

    const toSeries = (obj) => Object.entries(obj || {})
      .map(([date, value]) => ({date, value: Number(value)}))
      .filter((row) => row.date && Number.isFinite(row.value));

    const fullSeries = toSeries(index.dailyIndexTotal);
    const fullSalesSeries = toSeries(index.dailySalesTotal);

    return JSON.stringify({
      source: 'cardladder-live-safari',
      fetchedAt: new Date().toISOString(),
      title: nuxt.data[0].label || 'Pokemon',
      sourceUrl: location.href,
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
      fullSeries,
      fullSalesSeries,
    });
  })();`;
}

function extractJsonFromSafari() {
  const script = `tell application "Safari"\n` +
    `  activate\n` +
    `  if (count of documents) = 0 then\n` +
    `    make new document with properties {URL:"${CARDLADDER_URL}"}\n` +
    `  else\n` +
    `    set URL of front document to "${CARDLADDER_URL}"\n` +
    `  end if\n` +
    `  delay 2\n` +
    `  return do JavaScript "${jsExtractor().replace(/\\/g, '\\\\').replace(/\"/g, '\\\"').replace(/\n/g, ' ')}" in front document\n` +
    `end tell`;
  return runAppleScript(script);
}

function withRecentSeries(payload) {
  const fullSeries = payload.fullSeries ?? [];
  const fullSalesSeries = payload.fullSalesSeries ?? [];
  const parse = (date) => {
    const [month, day, year] = date.split('/').map(Number);
    return Date.UTC(year, month - 1, day);
  };
  const latest = fullSeries.at(-1);
  const cutoff = latest ? new Date(parse(latest.date)) : null;
  if (cutoff) cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 10);
  const cutoffTs = cutoff ? cutoff.getTime() : 0;
  return {
    ...payload,
    recentSeries: fullSeries.filter((row) => parse(row.date) >= cutoffTs),
    recentSalesSeries: fullSalesSeries.filter((row) => parse(row.date) >= cutoffTs),
  };
}

try {
  const raw = extractJsonFromSafari();
  const parsed = JSON.parse(raw);
  if (parsed.error) {
    throw new Error(parsed.error);
  }
  const payload = withRecentSeries(parsed);
  writeFileSync(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`updated ${OUTPUT_FILE}`);
} catch (error) {
  const message = [
    'CardLadder live update failed.',
    '',
    'Make sure Safari is open on the logged-in CardLadder tab and enable:',
    'Safari Settings → Advanced → Show features for web developers',
    'then Safari Settings → Developer → Allow JavaScript from Apple Events',
    '',
    `Original error: ${error.message}`,
  ].join('\n');
  console.error(message);
  process.exit(1);
}
