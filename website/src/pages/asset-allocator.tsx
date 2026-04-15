import React, {useEffect, useMemo, useState} from 'react';
import Layout from '@theme/Layout';
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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.setAttribute('data-theme-choice', 'dark');
  }, []);

  return (
    <Layout
      title="Asset Allocator"
      description="A broad buy-rating dashboard for crypto, stocks, Pokemon, and Yu-Gi-Oh using long-term valuation and trend signals."
    >
      <main style={{padding: '2rem 0 4rem', background: 'linear-gradient(180deg, #0b1020 0%, #0a0f1b 100%)', color: '#eef2ff', minHeight: '100vh'}}>
        <div style={pageFrame}>
          <section style={{textAlign: 'center', marginBottom: '1.4rem'}}>
            <h1 style={{margin: 0, fontSize: '2.4rem', lineHeight: 1.1}}>Asset Allocator</h1>
          </section>

          <section style={laneGrid}>
            {scoredCategories.map(({category, result}) => {
              const active = category.id === selectedId;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedId(category.id)}
                  aria-pressed={active}
                  title={`Open ${category.title}`}
                  style={{...laneCard, ...(active ? laneCardActive : {})}}
                >
                  <div style={laneCardTop}>
                    <div style={laneBadge}>{category.symbol}</div>
                    <div style={{textAlign: 'right'}}>
                      <div style={{fontSize: '2.3rem', fontWeight: 800, color: scoreColor(result.score), lineHeight: 1}}>{result.score}</div>
                      <div style={{fontSize: '0.8rem', color: 'rgba(238,242,255,0.72)'}}>out of 100</div>
                    </div>
                  </div>

                  <div style={{textAlign: 'left', marginTop: '0.9rem'}}>
                    <h2 style={{margin: '0.15rem 0 0.2rem', fontSize: '1.25rem'}}>{category.title}</h2>
                    <div style={{fontSize: '0.82rem', color: 'rgba(238,242,255,0.72)', textTransform: 'uppercase', letterSpacing: '0.08em'}}>
                      {category.source}
                    </div>
                    <div style={{marginTop: '0.35rem', fontSize: '0.88rem', color: 'rgba(238,242,255,0.76)', lineHeight: 1.45}}>
                      {category.subtitle}
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

          <section style={selectedShell}>
            <div style={selectedHeader}>
              <div>
                <div style={eyebrow}>Selected lane</div>
                <h2 style={{margin: '0.15rem 0 0'}}>Selected category: {selected.category.title}</h2>
                <div style={{marginTop: '0.35rem', color: 'rgba(238,242,255,0.76)', lineHeight: 1.55}}>{selected.category.subtitle}</div>
              </div>
              <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center'}}>
                <Pill tone={getBandTone(selected.result.score)}>{selected.result.label}</Pill>
                <Pill tone="slate">{selected.category.symbol}</Pill>
              </div>
            </div>

            <div style={selectedGrid}>
              <div style={selectedCard}>
                <div style={subheading}>Indicator stack</div>
                <div style={{color: 'rgba(238,242,255,0.76)', lineHeight: 1.65, marginBottom: '0.9rem'}}>
                  Weighted blend of long-term trend, RSI, drawdown, and participation signals.
                </div>
                <div style={{display: 'grid', gap: '0.6rem', marginTop: '1rem'}}>
                  {selected.result.details.map((row) => (
                    <IndicatorRow key={row.key} label={row.label} value={formatIndicatorValue(row)} score={row.score} weight={row.weight} note={row.note} />
                  ))}
                </div>
              </div>

              <div style={selectedCard}>
                <div style={subheading}>What is in scope right now</div>
                <ul style={{margin: '0.6rem 0 0', paddingLeft: '1.2rem', color: 'rgba(238,242,255,0.72)', lineHeight: 1.7}}>
                  {selected.category.watchItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

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
    slate: {background: 'rgba(255, 255, 255, 0.05)', color: '#eef2ff', borderColor: 'rgba(255,255,255,0.08)'},
  };

  return <span style={{...pillBase, ...stylesByTone[tone]}}>{children}</span>;
}

function MiniFact({label, value}: {label: string; value: string}) {
  return (
    <div style={{display: 'flex', justifyContent: 'space-between', gap: '0.75rem', paddingBottom: '0.45rem', borderBottom: '1px solid rgba(255,255,255,0.07)'}}>
      <span style={{color: 'rgba(238,242,255,0.72)'}}>{label}</span>
      <strong style={{textAlign: 'right'}}>{value}</strong>
    </div>
  );
}

function IndicatorRow({label, value, score, weight, note}: {label: string; value: string; score: number; weight: number; note: string}) {
  return (
    <div style={indicatorRow}>
      <div style={{display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center'}}>
        <div>
          <div style={{fontWeight: 700}}>{label}</div>
          <div style={{color: 'rgba(238,242,255,0.72)', fontSize: '0.88rem'}}>{note}</div>
        </div>
        <div style={{textAlign: 'right'}}>
          <div style={{fontWeight: 800, color: scoreColor(score)}}>{value}</div>
          <div style={{color: 'rgba(238,242,255,0.72)', fontSize: '0.8rem'}}>{weight}% weight</div>
        </div>
      </div>
      <div style={{marginTop: '0.55rem'}}>
        <ScoreBar score={score} compact />
      </div>
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
  color: 'rgba(238,242,255,0.72)',
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

const laneGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '1rem',
};

const pageFrame: React.CSSProperties = {
  width: 'min(1120px, calc(100% - 2rem))',
  margin: '0 auto',
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

const selectedShell: React.CSSProperties = {
  marginTop: '1.4rem',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 22,
  padding: '1rem',
  boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
};

const selectedHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '1rem',
  alignItems: 'center',
  flexWrap: 'wrap',
};

const selectedGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '1rem',
  marginTop: '1rem',
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
