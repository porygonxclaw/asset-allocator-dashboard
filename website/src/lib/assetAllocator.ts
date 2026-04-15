export type AssetCategoryId = 'crypto' | 'stocks' | 'pokemon' | 'yugioh';

export type IndicatorKey =
  | 'priceVs200D'
  | 'priceVs200W'
  | 'rsi'
  | 'drawdownFromAth'
  | 'relativeVolume'
  | 'oneYearChange';

export type IndicatorSnapshot = {
  key: IndicatorKey;
  label: string;
  value: number;
  unit: 'pct' | 'rsi' | 'x';
  note: string;
};

export type CategorySnapshot = {
  id: AssetCategoryId;
  title: string;
  symbol: string;
  subtitle: string;
  thesis: string;
  source: string;
  updatedAt: string;
  confidence: 'high' | 'medium' | 'low';
  watchItems: string[];
  indicators: IndicatorSnapshot[];
  weights: Record<IndicatorKey, number>;
  drillDownHint: string;
};

export const SCORE_BANDS = [
  {min: 85, label: 'must buy', tone: 'green'},
  {min: 70, label: 'buy', tone: 'amber'},
  {min: 55, label: 'watch', tone: 'blue'},
  {min: 0, label: 'avoid', tone: 'red'},
] as const;

export const ASSET_CATEGORIES: CategorySnapshot[] = [
  {
    id: 'crypto',
    title: 'Crypto',
    symbol: '₿',
    subtitle: 'TOTAL crypto market cap for now, with BTC and HYPE as the next drill-down lane.',
    thesis: 'The broad crypto market is still workable, but it is no longer cheap enough to blindly smash buy without trend support and real participation.',
    source: 'CoinGecko TOTAL global market cap',
    updatedAt: 'live pull · 2026-04-15',
    confidence: 'medium',
    watchItems: ['BTC dominance', 'HYPE liquidity', 'total market breadth', 'weekly closes'],
    indicators: [
      {key: 'priceVs200D', label: 'vs 200D MA', value: -15, unit: 'pct', note: 'still below the long trend line'},
      {key: 'priceVs200W', label: 'vs 200W MA', value: 17, unit: 'pct', note: 'now stretched above the long weekly trend'},
      {key: 'rsi', label: 'weekly RSI', value: 41, unit: 'rsi', note: 'cooling off, but not washed out enough to scream buy'},
      {key: 'drawdownFromAth', label: 'drawdown from ATH', value: 41, unit: 'pct', note: 'real discount off the highs'},
      {key: 'relativeVolume', label: 'relative volume', value: 0.95, unit: 'x', note: '24h volume is roughly normal versus market cap'},
      {key: 'oneYearChange', label: '1Y change', value: -5, unit: 'pct', note: 'soft one-year tape, which helps the entry case'},
    ],
    weights: {
      priceVs200D: 23,
      priceVs200W: 12,
      rsi: 14,
      drawdownFromAth: 18,
      relativeVolume: 13,
      oneYearChange: 20,
    },
    drillDownHint: 'Later: BTC, HYPE, ETH, majors, and a separate cycle regime view.',
  },
  {
    id: 'stocks',
    title: 'Stocks',
    symbol: 'SPY',
    subtitle: 'SPY is the starter benchmark until you add your real watchlist.',
    thesis: 'Stocks should score higher when the market pulls back into trend support with volume that says the dip is actually being bought. Right now SPY is still a bit hot versus the long trend.',
    source: 'Yahoo Finance SPY',
    updatedAt: 'live pull · 2026-04-15',
    confidence: 'high',
    watchItems: ['SPY trend regime', 'earnings season risk', 'rates / macro', 'rotation into value or growth'],
    indicators: [
      {key: 'priceVs200D', label: 'vs 200D MA', value: 4, unit: 'pct', note: 'slightly above the 200D line'},
      {key: 'priceVs200W', label: 'vs 200W MA', value: 33, unit: 'pct', note: 'far above the 200W line, so it is not cheap'},
      {key: 'rsi', label: 'weekly RSI', value: 59, unit: 'rsi', note: 'warm, but not blown out'},
      {key: 'drawdownFromAth', label: 'drawdown from ATH', value: 0.2, unit: 'pct', note: 'basically at the highs'},
      {key: 'relativeVolume', label: 'relative volume', value: 0.71, unit: 'x', note: 'volume is below the recent 50-day average'},
      {key: 'oneYearChange', label: '1Y change', value: 30, unit: 'pct', note: 'strong yearly trend, but not a bargain'},
    ],
    weights: {
      priceVs200D: 26,
      priceVs200W: 18,
      rsi: 10,
      drawdownFromAth: 14,
      relativeVolume: 6,
      oneYearChange: 26,
    },
    drillDownHint: 'Later: separate short list of stocks with earnings, sector, and catalyst tags.',
  },
  {
    id: 'pokemon',
    title: 'Pokemon',
    symbol: '⚡',
    subtitle: 'CardLadder Pokemon index now, then specific cards and sealed later.',
    thesis: 'This should light up when the index is beaten down, the trend resets, and liquidity does not totally disappear.',
    source: 'CardLadder Pokemon index',
    updatedAt: 'live pull · 2026-04-15',
    confidence: 'medium',
    watchItems: ['index trend', 'raw vs graded spread', 'sealed product breadth', 'week-to-week liquidity'],
    indicators: [
      {key: 'priceVs200D', label: 'vs 200D MA', value: -17, unit: 'pct', note: 'well below trend, looks cheaper than the stock sleeve'},
      {key: 'priceVs200W', label: 'vs 200W MA', value: -24, unit: 'pct', note: 'macro reset is doing some work here'},
      {key: 'rsi', label: 'weekly RSI', value: 41, unit: 'rsi', note: 'more washed out than stocks'},
      {key: 'drawdownFromAth', label: 'drawdown from ATH', value: 37, unit: 'pct', note: 'good discount zone for a collectible index'},
      {key: 'relativeVolume', label: 'relative volume', value: 0.72, unit: 'x', note: 'not dead, but still a thinner tape'},
      {key: 'oneYearChange', label: '1Y change', value: -8, unit: 'pct', note: 'mildly soft on the yearly lens'},
    ],
    weights: {
      priceVs200D: 18,
      priceVs200W: 10,
      rsi: 12,
      drawdownFromAth: 24,
      relativeVolume: 18,
      oneYearChange: 18,
    },
    drillDownHint: 'Later: set pages, trophy cards, graded keycards, and sealed boxes.',
  },
  {
    id: 'yugioh',
    title: 'Yu-Gi-Oh!',
    symbol: '✦',
    subtitle: 'CardLadder Yu-Gi-Oh index with room for promos, 1st ed grails, and sealed product.',
    thesis: 'Better when the vintage index is discounted and the market is not already chasing the obvious blue-chip names.',
    source: 'CardLadder Yu-Gi-Oh index',
    updatedAt: 'live pull · 2026-04-15',
    confidence: 'medium',
    watchItems: ['blue-chip support pieces', 'promo demand', '1st ed vs unlimited spread', 'sealed volume'],
    indicators: [
      {key: 'priceVs200D', label: 'vs 200D MA', value: -11, unit: 'pct', note: 'below trend, but less depressed than Pokemon'},
      {key: 'priceVs200W', label: 'vs 200W MA', value: -18, unit: 'pct', note: 'macro backdrop is still cheap-ish'},
      {key: 'rsi', label: 'weekly RSI', value: 44, unit: 'rsi', note: 'cool enough to care, not a panic zone'},
      {key: 'drawdownFromAth', label: 'drawdown from ATH', value: 31, unit: 'pct', note: 'nice middle-ground value pocket'},
      {key: 'relativeVolume', label: 'relative volume', value: 0.68, unit: 'x', note: 'liquidity is the main caveat here'},
      {key: 'oneYearChange', label: '1Y change', value: -5, unit: 'pct', note: 'year view is soft, which can help entry timing'},
    ],
    weights: {
      priceVs200D: 18,
      priceVs200W: 10,
      rsi: 12,
      drawdownFromAth: 24,
      relativeVolume: 18,
      oneYearChange: 18,
    },
    drillDownHint: 'Later: Blue-Eyes, Dark Magician, Jinzo, DMG, Exodia, promos, and sealed.',
  },
];

const MA_BANDS: Record<'priceVs200D' | 'priceVs200W', number> = {
  priceVs200D: 20,
  priceVs200W: 35,
};

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function scorePriceVsMa(value: number, band: number) {
  return clamp(50 - (value / band) * 50, 0, 100);
}

export function scoreRsi(value: number) {
  return clamp(100 - Math.abs(value - 45) * 4, 0, 100);
}

export function scoreDrawdown(value: number) {
  return clamp(100 - Math.abs(value - 35) * 2.5, 0, 100);
}

export function scoreRelativeVolume(value: number) {
  return clamp(((value - 0.25) / 1.75) * 100, 0, 100);
}

export function scoreOneYearChange(value: number) {
  return clamp(100 - Math.abs(value - 15) * 1.5, 0, 100);
}

export function scoreIndicator(indicator: IndicatorSnapshot) {
  switch (indicator.key) {
    case 'priceVs200D':
    case 'priceVs200W':
      return scorePriceVsMa(indicator.value, MA_BANDS[indicator.key]);
    case 'rsi':
      return scoreRsi(indicator.value);
    case 'drawdownFromAth':
      return scoreDrawdown(indicator.value);
    case 'relativeVolume':
      return scoreRelativeVolume(indicator.value);
    case 'oneYearChange':
      return scoreOneYearChange(indicator.value);
    default:
      return 0;
  }
}

export function scoreCategory(category: CategorySnapshot) {
  const details = category.indicators.map((indicator) => {
    const weight = category.weights[indicator.key];
    const score = scoreIndicator(indicator);
    return {
      ...indicator,
      weight,
      score,
      contribution: (weight * score) / 100,
    };
  });

  const score = clamp(
    Math.round(details.reduce((sum, row) => sum + row.contribution, 0)),
    0,
    100,
  );

  const totalWeight = details.reduce((sum, row) => sum + row.weight, 0);

  return {
    score,
    weightTotal: totalWeight,
    details,
    label: score >= 85 ? 'must buy' : score >= 70 ? 'buy' : score >= 55 ? 'watch' : 'avoid',
  };
}

export function getBandLabel(score: number) {
  return SCORE_BANDS.find((band) => score >= band.min)?.label ?? 'avoid';
}

export function getBandTone(score: number) {
  return SCORE_BANDS.find((band) => score >= band.min)?.tone ?? 'red';
}

export function formatIndicatorValue(indicator: IndicatorSnapshot) {
  if (indicator.unit === 'rsi') {
    return `${indicator.value.toFixed(0)}`;
  }
  if (indicator.unit === 'x') {
    return `${indicator.value.toFixed(2)}x`;
  }
  const sign = indicator.value > 0 ? '+' : '';
  return `${sign}${indicator.value.toFixed(0)}%`;
}

export function scoreBandDescription(score: number) {
  if (score >= 85) return 'super undervalued';
  if (score >= 70) return 'undervalued';
  if (score >= 55) return 'mixed';
  return 'stretched';
}
