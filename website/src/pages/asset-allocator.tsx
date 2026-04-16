import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import styles from './asset-allocator.module.css';
import pokemonIndexData from '../data/cardladder-pokemon-index.json';
import {
  ASSET_CATEGORIES,
  formatIndicatorValue,
  getBandLabel,
  getBandTone,
  scoreBandDescription,
  scoreCategory,
  type AssetCategoryId,
} from '../lib/assetAllocator';

export default function AssetAllocatorPage() {
  const scoredCategories = useMemo(() => ASSET_CATEGORIES.map((category) => ({category, result: scoreCategory(category)})), []);
  const [selectedId, setSelectedId] = useState<AssetCategoryId>('crypto');

  const selected = scoredCategories.find((entry) => entry.category.id === selectedId) ?? scoredCategories[0];
  const pokemonSeriesSlice = useMemo(() => {
    const fullSeries = Array.isArray(pokemonIndexData?.fullSeries) ? pokemonIndexData.fullSeries : [];
    return sliceLastYears(fullSeries, 10);
  }, []);
  const pokemonTenYearChange = useMemo(() => {
    if (pokemonSeriesSlice.length < 2) return 0;
    const start = pokemonSeriesSlice[0].value;
    const end = pokemonSeriesSlice[pokemonSeriesSlice.length - 1].value;
    if (!start) return 0;
    return ((end - start) / start) * 100;
  }, [pokemonSeriesSlice]);

  return (
    <Layout
      title="Asset Allocator"
      description="A broad buy-rating dashboard for crypto, stocks, Pokemon, and Yu-Gi-Oh using long-term valuation and trend signals."
    >
      <main style={{padding: '2rem 0 4rem'}}>
        <div className={styles.pageFrame}>
          <section style={{textAlign: 'center', marginBottom: '1.4rem'}}>
            <h1 style={{margin: 0, fontSize: '2.4rem', lineHeight: 1.1}}>Asset Allocator</h1>
          </section>

          <section className={styles.laneGrid}>
            {scoredCategories.map(({category, result}) => {
              const active = category.id === selectedId;
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedId(category.id)}
                  style={{...laneCard, ...(active ? laneCardActive : {})}}
                >
                  <div style={laneCardTop}>
                    <div style={laneBadge}>{category.symbol}</div>
                    <div style={{textAlign: 'right'}}>
                      <div style={{fontSize: '2.3rem', fontWeight: 800, color: scoreColor(result.score), lineHeight: 1}}>{result.score}</div>
                      <div style={{fontSize: '0.8rem', color: 'var(--ifm-font-color-secondary)'}}>out of 100</div>
                    </div>
                  </div>

                  <div style={{textAlign: 'left', marginTop: '0.9rem'}}>
                    <h2 style={{margin: '0.15rem 0 0.2rem', fontSize: '1.25rem'}}>{category.title}</h2>
                    <div style={{fontSize: '0.82rem', color: 'var(--ifm-font-color-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em'}}>
                      {category.source}
                    </div>
                  </div>

                  <div style={{marginTop: '1rem'}}>
                    <ScoreBar score={result.score} />
                  </div>

                  <div style={{marginTop: '0.85rem', display: 'flex', justifyContent: 'space-between', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap'}}>
                    <Pill tone={getBandTone(result.score)}>{getBandLabel(result.score)}</Pill>
                    <Pill tone="slate">{category.updatedAt}</Pill>
                  </div>
                </button>
              );
            })}
          </section>

          <section className={styles.selectedShell}>
            <div className={styles.selectedHeader}>
              <div>
                <div style={eyebrow}>Selected lane</div>
                <h2 style={{margin: '0.15rem 0 0'}}>Selected category: {selected.category.title}</h2>
              </div>
              <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center'}}>
                <Pill tone={getBandTone(selected.result.score)}>{selected.result.label}</Pill>
                <Pill tone="slate">{selected.category.symbol}</Pill>
              </div>
            </div>

            <div className={styles.selectedGrid}>
              <div style={selectedCard}>
                <div style={subheading}>What is in scope right now</div>
                <ul style={{margin: '0.6rem 0 0', paddingLeft: '1.2rem', color: 'var(--ifm-font-color-secondary)', lineHeight: 1.7}}>
                  {selected.category.watchItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <div style={{marginTop: '1.2rem'}}>
                  <div style={subheading}>Indicator inputs</div>
                  <div style={{display: 'grid', gap: '0.55rem', marginTop: '0.6rem'}}>
                    {selected.result.details.map((row) => (
                      <MiniFact
                        key={row.key}
                        label={row.label}
                        value={`${formatIndicatorValue(row)} • ${row.score.toFixed(0)} / 100`}
                      />
                    ))}
                  </div>
                </div>

                {selected.category.id === 'pokemon' ? (
                  <div style={{marginTop: '1.3rem'}}>
                    <div style={subheading}>Card Ladder Pokemon index chart</div>
                    <PokemonChart series={pokemonSeriesSlice} currentValue={pokemonIndexData.summary.currentValue} />
                    <div style={{display: 'grid', gap: '0.55rem', marginTop: '0.8rem'}}>
                      <MiniFact label="Series window" value={`${pokemonSeriesSlice[0]?.date ?? 'n/a'} → ${pokemonSeriesSlice.at(-1)?.date ?? 'n/a'}`} />
                      <MiniFact label="Current value" value={String(Math.round(pokemonIndexData.summary.currentValue))} />
                      <MiniFact label="10y change" value={`${pokemonTenYearChange.toFixed(2)}%`} />
                    </div>
                  </div>
                ) : null}

                <div style={{marginTop: '1.2rem'}}>
                  <div style={subheading}>Model setup</div>
                  <div style={{display: 'grid', gap: '0.6rem', marginTop: '0.6rem'}}>
                    <MiniFact label="Signal type" value="weekly / long-term / low-noise" />
                    <MiniFact label="Primary sources" value={selected.category.source} />
                    <MiniFact label="Next drill-down" value={selected.category.drillDownHint} />
                    <MiniFact label="Score view" value={`${selected.result.score}/100 • ${scoreBandDescription(selected.result.score)}`} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}

function Pill({tone, children}: {tone: 'green' | 'blue' | 'amber' | 'red' | 'slate'; children: React.ReactNode}) {
  const stylesByTone: Record<typeof tone, React.CSSProperties> = {
    green: {background: 'rgba(56, 211, 159, 0.12)', color: '#8ef0c6', borderColor: 'rgba(56, 211, 159, 0.18)'},
    blue: {background: 'rgba(125, 211, 252, 0.10)', color: '#bdefff', borderColor: 'rgba(125, 211, 252, 0.18)'},
    amber: {background: 'rgba(255, 209, 102, 0.10)', color: '#ffe08a', borderColor: 'rgba(255, 209, 102, 0.18)'},
    red: {background: 'rgba(255, 123, 123, 0.10)', color: '#ffb7b7', borderColor: 'rgba(255, 123, 123, 0.18)'},
    slate: {background: 'rgba(255, 255, 255, 0.05)', color: 'var(--ifm-font-color-base)', borderColor: 'rgba(255,255,255,0.08)'},
  };

  return <span style={{...pillBase, ...stylesByTone[tone]}}>{children}</span>;
}

function MiniFact({label, value}: {label: string; value: string}) {
  return (
    <div style={{display: 'flex', justifyContent: 'space-between', gap: '0.75rem', paddingBottom: '0.45rem', borderBottom: '1px solid rgba(255,255,255,0.07)'}}>
      <span style={{color: 'var(--ifm-font-color-secondary)'}}>{label}</span>
      <strong style={{textAlign: 'right'}}>{value}</strong>
    </div>
  );
}

function ScoreBar({score, compact = false}: {score: number; compact?: boolean}) {
  return (
    <div style={{...scoreTrack, height: compact ? 8 : 10}}>
      <div style={{...scoreFill, width: `${score}%`, background: scoreGradient(score)}} />
    </div>
  );
}

function PokemonChart({series, currentValue}: {series: Array<{date: string; value: number}>; currentValue: number}) {
  if (!series.length) {
    return (
      <div style={{...selectedCard, display: 'grid', placeItems: 'center', minHeight: 220, color: 'var(--ifm-font-color-secondary)'}}>
        no live series yet
      </div>
    );
  }

  const values = series.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = 18;
  const width = 640;
  const height = 220;
  const range = Math.max(1, max - min);
  const points = series
    .map((point, index) => {
      const x = pad + (index / Math.max(1, series.length - 1)) * (width - pad * 2);
      const y = height - pad - ((point.value - min) / range) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div style={{...selectedCard, padding: '0.8rem'}}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="220" role="img" aria-label="Card Ladder Pokemon index chart, last 10 years">
        <defs>
          <linearGradient id="pokemonLineGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#ffd166" />
            <stop offset="100%" stopColor="#8ef0c6" />
          </linearGradient>
          <linearGradient id="pokemonAreaGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255, 209, 102, 0.28)" />
            <stop offset="100%" stopColor="rgba(255, 209, 102, 0.02)" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((ratio) => {
          const y = pad + ratio * (height - pad * 2);
          return <line key={ratio} x1={pad} x2={width - pad} y1={y} y2={y} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />;
        })}
        <path d={`M ${points} L ${width - pad},${height - pad} L ${pad},${height - pad} Z`} fill="url(#pokemonAreaGradient)" opacity="0.6" />
        <polyline points={points} fill="none" stroke="url(#pokemonLineGradient)" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={width - pad} cy={height - pad - ((series[series.length - 1].value - min) / range) * (height - pad * 2)} r="5" fill="#8ef0c6" />
        <text x={pad} y={18} fill="rgba(238,242,255,0.72)" fontSize="12">low {Math.round(min)}</text>
        <text x={pad} y={height - 6} fill="rgba(238,242,255,0.62)" fontSize="12">{series[0].date}</text>
        <text x={width - pad} y={height - 6} textAnchor="end" fill="#eef2ff" fontSize="16" fontWeight="700">current {Math.round(currentValue)}</text>
      </svg>
    </div>
  );
}

function parseCardLadderDate(date: string) {
  const [month, day, year] = date.split('/').map(Number);
  return Date.UTC(year, month - 1, day);
}

function sliceLastYears(series: Array<{date: string; value: number}>, years: number) {
  if (!series.length) return [];
  const latest = parseCardLadderDate(series[series.length - 1].date);
  const cutoff = new Date(latest);
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - years);
  const cutoffTs = cutoff.getTime();
  return series.filter((row) => parseCardLadderDate(row.date) >= cutoffTs);
}

function scoreGradient(score: number) {
  const hue = Math.max(0, Math.min(120, Math.round(score * 1.2)));
  return `linear-gradient(90deg, hsl(${hue} 85% 55%), hsl(${Math.min(120, hue + 14)} 90% 68%))`;
}

function scoreColor(score: number) {
  const hue = Math.max(0, Math.min(120, Math.round(score * 1.2)));
  return `hsl(${hue} 90% 66%)`;
}

const eyebrow: React.CSSProperties = {
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--ifm-font-color-secondary)',
  fontWeight: 800,
};

const subheading: React.CSSProperties = {
  ...eyebrow,
  marginBottom: '0.3rem',
};

const pillBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  padding: '0.3rem 0.65rem',
  borderRadius: 999,
  fontSize: '0.8rem',
  border: '1px solid rgba(255,255,255,0.08)',
  fontWeight: 700,
  whiteSpace: 'nowrap',
};

const laneCard: React.CSSProperties = {
  width: '100%',
  minHeight: 220,
  textAlign: 'left',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 20,
  padding: '1rem',
  cursor: 'pointer',
  color: 'inherit',
  boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
  transition: 'transform 120ms ease, border-color 120ms ease, background 120ms ease',
  touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent',
  userSelect: 'none',
};

const laneCardActive: React.CSSProperties = {
  borderColor: 'rgba(255, 209, 102, 0.35)',
  background: 'rgba(255, 209, 102, 0.06)',
  transform: 'translateY(-1px)',
};

const laneCardTop: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '0.8rem',
  alignItems: 'start',
};

const laneBadge: React.CSSProperties = {
  width: 58,
  height: 58,
  borderRadius: 18,
  display: 'grid',
  placeItems: 'center',
  fontSize: '1.5rem',
  fontWeight: 800,
  background: 'linear-gradient(135deg, rgba(255,209,102,0.18), rgba(255,255,255,0.03))',
  border: '1px solid rgba(255,255,255,0.08)',
  flexShrink: 0,
};

const selectedCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 18,
  padding: '1rem',
};

const indicatorRow: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: '0.85rem',
  background: 'rgba(255,255,255,0.02)',
};

const scoreTrack: React.CSSProperties = {
  width: '100%',
  borderRadius: 999,
  background: 'rgba(255,255,255,0.07)',
  overflow: 'hidden',
};

const scoreFill: React.CSSProperties = {
  height: '100%',
  borderRadius: 999,
};

