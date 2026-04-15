import React, {useMemo, useState} from 'react';
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

  const summary = useMemo(() => {
    const average = Math.round(scoredCategories.reduce((sum, entry) => sum + entry.result.score, 0) / scoredCategories.length);
    const hottest = scoredCategories.reduce((best, entry) => (entry.result.score > best.result.score ? entry : best), scoredCategories[0]);
    const coldest = scoredCategories.reduce((worst, entry) => (entry.result.score < worst.result.score ? entry : worst), scoredCategories[0]);
    return {average, hottest, coldest};
  }, [scoredCategories]);

  return (
    <Layout
      title="Asset Allocator"
      description="A broad buy-rating dashboard for crypto, stocks, Pokemon, and Yu-Gi-Oh using long-term valuation and trend signals."
    >
      <main style={{padding: '2rem 0 4rem'}}>
        <div className="container">
          <section style={{marginBottom: '1.5rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'end'}}>
              <div style={{maxWidth: 880}}>
                <div style={eyebrow}>Asset Allocator</div>
                <h1 style={{margin: '0.25rem 0 0.5rem'}}>4-category buy rating dashboard</h1>
                <p style={{margin: 0, color: 'var(--ifm-font-color-secondary)', lineHeight: 1.6}}>
                  The score runs from 0 to 100. 100 means super undervalued and buy hard. 0 means do not touch.
                  Right now the dashboard tracks crypto, stocks, Pokemon, and Yu-Gi-Oh at a broad index level.
                </p>
              </div>

              <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                <Badge tone="green">works on phone + tablet + desktop</Badge>
                <Badge tone="blue">seed snapshot</Badge>
                <Badge tone="amber">click a category for detail</Badge>
              </div>
            </div>
          </section>

          <section style={summaryGrid}>
            <SummaryTile label="Average buy rating" value={`${summary.average}/100`} note={scoreBandDescription(summary.average)} />
            <SummaryTile label="Best value lane" value={summary.hottest.category.title} note={`${summary.hottest.result.score}/100 • ${getBandLabel(summary.hottest.result.score)}`} />
            <SummaryTile label="Most stretched" value={summary.coldest.category.title} note={`${summary.coldest.result.score}/100 • ${getBandLabel(summary.coldest.result.score)}`} />
            <SummaryTile label="Current tilt" value={summary.average >= 70 ? 'add risk' : summary.average >= 55 ? 'wait for better tape' : 'defensive'} note="broad allocation signal" />
          </section>

          <section style={{display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', marginTop: '1.5rem'}}>
            {scoredCategories.map(({category, result}) => {
              const active = category.id === selectedId;
              return (
                <button key={category.id} type="button" onClick={() => setSelectedId(category.id)} style={{...categoryButton, ...(active ? categoryButtonActive : {})}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'start'}}>
                    <div style={{display: 'flex', gap: '0.8rem', alignItems: 'center', textAlign: 'left'}}>
                      <div style={categoryIcon}>{category.symbol}</div>
                      <div>
                        <div style={{fontSize: '0.82rem', color: 'var(--ifm-font-color-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em'}}>{category.source}</div>
                        <h2 style={{margin: '0.1rem 0 0.2rem', fontSize: '1.15rem'}}>{category.title}</h2>
                        <div style={{color: 'var(--ifm-font-color-secondary)', fontSize: '0.92rem', lineHeight: 1.45}}>{category.subtitle}</div>
                      </div>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <div style={{fontSize: '2rem', fontWeight: 800, color: scoreColor(result.score)}}>{result.score}</div>
                      <div style={{fontSize: '0.8rem', color: 'var(--ifm-font-color-secondary)'}}>out of 100</div>
                    </div>
                  </div>

                  <div style={{display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center', marginTop: '0.9rem', flexWrap: 'wrap'}}>
                    <Pill tone={getBandTone(result.score)}>{getBandLabel(result.score)}</Pill>
                    <Pill tone="slate">confidence: {category.confidence}</Pill>
                    <Pill tone="slate">{category.updatedAt}</Pill>
                  </div>

                  <div style={{marginTop: '0.9rem'}}>
                    <ScoreBar score={result.score} />
                  </div>

                  <div style={{marginTop: '0.85rem', color: 'var(--ifm-font-color-secondary)', textAlign: 'left', lineHeight: 1.55}}>{category.thesis}</div>
                </button>
              );
            })}
          </section>

          <section style={detailShell}>
            <div style={detailHeaderRow}>
              <div>
                <div style={eyebrow}>Detail view</div>
                <h2 style={{margin: '0.2rem 0 0'}}>Selected category: {selected.category.title}</h2>
              </div>
              <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center'}}>
                <Pill tone={getBandTone(selected.result.score)}>{selected.result.label}</Pill>
                <Pill tone="slate">{selected.category.symbol}</Pill>
              </div>
            </div>

            <div style={detailGrid}>
              <div style={detailCard}>
                <div style={subheading}>Why it looks this way</div>
                <p style={{marginTop: 0, color: 'var(--ifm-font-color-secondary)', lineHeight: 1.65}}>{selected.category.thesis}</p>
                <div style={{display: 'grid', gap: '0.6rem', marginTop: '1rem'}}>
                  {selected.result.details.map((row) => (
                    <IndicatorRow key={row.key} label={row.label} value={formatIndicatorValue(row)} score={row.score} weight={row.weight} note={row.note} />
                  ))}
                </div>
              </div>

              <div style={detailCard}>
                <div style={subheading}>What is in scope right now</div>
                <ul style={{margin: '0.6rem 0 0', paddingLeft: '1.2rem', color: 'var(--ifm-font-color-secondary)', lineHeight: 1.7}}>
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

          <section style={footerPanel}>
            <div style={subheading}>Scoring rules</div>
            <div style={{display: 'grid', gap: '0.45rem', color: 'var(--ifm-font-color-secondary)', lineHeight: 1.6}}>
              <div>• 200D and 200W MA are treated as “cheap vs trend” signals</div>
              <div>• weekly RSI is kept long-term so it does not flicker every day</div>
              <div>• drawdown from ATH rewards real discounts without chasing total collapse</div>
              <div>• relative volume checks whether the move has actual participation</div>
              <div>• 1Y change catches full-cycle stretch without becoming the whole score</div>
            </div>
            <div style={{marginTop: '0.9rem', color: 'var(--ifm-font-color-secondary)'}}>
              This is a starter build. Next step is to swap the seed snapshot for live or scheduled data pulls, then add individual asset pages.
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}

function SummaryTile({label, value, note}: {label: string; value: string; note: string}) {
  return (
    <div style={summaryTile}>
      <div style={eyebrow}>{label}</div>
      <div style={{fontSize: '1.6rem', fontWeight: 800, marginTop: '0.35rem'}}>{value}</div>
      <div style={{color: 'var(--ifm-font-color-secondary)', marginTop: '0.2rem', lineHeight: 1.5}}>{note}</div>
    </div>
  );
}

function Badge({tone, children}: {tone: 'green' | 'blue' | 'amber'; children: React.ReactNode}) {
  const stylesByTone: Record<typeof tone, React.CSSProperties> = {
    green: {background: 'rgba(56, 211, 159, 0.12)', color: '#8ef0c6', borderColor: 'rgba(56, 211, 159, 0.18)'},
    blue: {background: 'rgba(125, 211, 252, 0.10)', color: '#bdefff', borderColor: 'rgba(125, 211, 252, 0.18)'},
    amber: {background: 'rgba(255, 209, 102, 0.10)', color: '#ffe08a', borderColor: 'rgba(255, 209, 102, 0.18)'},
  };

  return <span style={{...pillBase, ...stylesByTone[tone]}}>{children}</span>;
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

function IndicatorRow({label, value, score, weight, note}: {label: string; value: string; score: number; weight: number; note: string}) {
  return (
    <div style={indicatorRow}>
      <div style={{display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center'}}>
        <div>
          <div style={{fontWeight: 700}}>{label}</div>
          <div style={{color: 'var(--ifm-font-color-secondary)', fontSize: '0.88rem'}}>{note}</div>
        </div>
        <div style={{textAlign: 'right'}}>
          <div style={{fontWeight: 800, color: scoreColor(score)}}>{value}</div>
          <div style={{color: 'var(--ifm-font-color-secondary)', fontSize: '0.8rem'}}>{weight}% weight</div>
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
  if (score >= 85) return 'linear-gradient(90deg, #38d39f, #96f2c9)';
  if (score >= 70) return 'linear-gradient(90deg, #ffd166, #ffe59a)';
  if (score >= 55) return 'linear-gradient(90deg, #7dd3fc, #bdefff)';
  return 'linear-gradient(90deg, #ff7b7b, #ffb7b7)';
}

function scoreColor(score: number) {
  if (score >= 85) return '#8ef0c6';
  if (score >= 70) return '#ffe08a';
  if (score >= 55) return '#bdefff';
  return '#ffb7b7';
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

const summaryGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
  gap: '1rem',
};

const summaryTile: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 18,
  padding: '1rem',
  boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
};

const categoryButton: React.CSSProperties = {
  textAlign: 'left',
  width: '100%',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 20,
  padding: '1rem',
  cursor: 'pointer',
  color: 'inherit',
  boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
  transition: 'transform 120ms ease, border-color 120ms ease, background 120ms ease',
};

const categoryButtonActive: React.CSSProperties = {
  borderColor: 'rgba(255, 209, 102, 0.35)',
  background: 'rgba(255, 209, 102, 0.06)',
  transform: 'translateY(-1px)',
};

const categoryIcon: React.CSSProperties = {
  width: 54,
  height: 54,
  borderRadius: 16,
  display: 'grid',
  placeItems: 'center',
  fontSize: '1.4rem',
  fontWeight: 800,
  background: 'linear-gradient(135deg, rgba(255,209,102,0.18), rgba(255,255,255,0.03))',
  border: '1px solid rgba(255,255,255,0.08)',
  flexShrink: 0,
};

const detailShell: React.CSSProperties = {
  marginTop: '1.5rem',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 22,
  padding: '1rem',
  boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
};

const detailHeaderRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '1rem',
  alignItems: 'center',
  flexWrap: 'wrap',
};

const detailGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '1rem',
  marginTop: '1rem',
};

const detailCard: React.CSSProperties = {
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

const footerPanel: React.CSSProperties = {
  marginTop: '1.5rem',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 22,
  padding: '1rem',
};
