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
  const scoredCategories = useMemo(
    () => ASSET_CATEGORIES.map((category) => ({category, result: scoreCategory(category)})),
    [],
  );
  const [selectedId, setSelectedId] = useState<AssetCategoryId>('crypto');

  useEffect(() => {
    const theme = 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = 'dark';
    try {
      localStorage.setItem('theme', theme);
      localStorage.setItem('docusaurus.theme', theme);
    } catch {}
  }, []);

  const selected = scoredCategories.find((entry) => entry.category.id === selectedId) ?? scoredCategories[0];

  const summary = useMemo(() => {
    const average = Math.round(scoredCategories.reduce((sum, entry) => sum + entry.result.score, 0) / scoredCategories.length);
    const hottest = scoredCategories.reduce((best, entry) => (entry.result.score > best.result.score ? entry : best), scoredCategories[0]);
    const coldest = scoredCategories.reduce((worst, entry) => (entry.result.score < worst.result.score ? entry : worst), scoredCategories[0]);
    return {
      average,
      hottest,
      coldest,
      currentTilt: average >= 70 ? 'add risk' : average >= 55 ? 'wait for better tape' : 'defensive',
    };
  }, [scoredCategories]);

  return (
    <Layout
      title="Asset Allocator"
      description="A broad buy-rating dashboard for crypto, stocks, Pokemon, and Yu-Gi-Oh using long-term valuation and trend signals."
    >
      <main style={pageShell}>
        <div className="container">
          <section style={heroCard}>
            <div style={heroTopRow}>
              <div style={{maxWidth: 820}}>
                <div style={eyebrow}>Asset Allocator</div>
                <h1 style={heroTitle}>clean buy-rating dashboard</h1>
                <p style={heroCopy}>
                  0 means overcooked and untouchable. 100 means heavily discounted and worth leaning into.
                  right now it is set up for broad market timing across crypto, stocks, Pokemon, and Yu-Gi-Oh.
                </p>
              </div>
              <div style={heroChips}>
                <Badge tone="green">dark mode locked</Badge>
                <Badge tone="blue">phone + tablet + desktop</Badge>
                <Badge tone="amber">tap a lane for detail</Badge>
              </div>
            </div>

            <div style={summaryGrid}>
              <SummaryTile label="average buy rating" value={`${summary.average}/100`} note={scoreBandDescription(summary.average)} />
              <SummaryTile label="best value lane" value={summary.hottest.category.title} note={`${summary.hottest.result.score}/100 • ${getBandLabel(summary.hottest.result.score)}`} />
              <SummaryTile label="most stretched" value={summary.coldest.category.title} note={`${summary.coldest.result.score}/100 • ${getBandLabel(summary.coldest.result.score)}`} />
              <SummaryTile label="current tilt" value={summary.currentTilt} note="broad allocation signal" />
            </div>
          </section>

          <section style={contentGrid}>
            <div style={laneColumn}>
              <div style={sectionLabel}>market lanes</div>
              <div style={laneList}>
                {scoredCategories.map(({category, result}) => {
                  const active = category.id === selectedId;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedId(category.id)}
                      style={{...laneCard, ...(active ? laneCardActive : {})}}
                    >
                      <div style={laneHeader}>
                        <div style={laneIdentity}>
                          <div style={laneIcon}>{category.symbol}</div>
                          <div style={{minWidth: 0}}>
                            <div style={laneSource}>{category.source}</div>
                            <div style={laneTitle}>{category.title}</div>
                            <div style={laneSubtitle}>{category.subtitle}</div>
                          </div>
                        </div>
                        <div style={laneScoreBlock}>
                          <div style={{...laneScore, color: scoreColor(result.score)}}>{result.score}</div>
                          <div style={laneScoreLabel}>out of 100</div>
                        </div>
                      </div>

                      <div style={laneMetaRow}>
                        <Pill tone={getBandTone(result.score)}>{getBandLabel(result.score)}</Pill>
                        <Pill tone="slate">{category.confidence} confidence</Pill>
                        <Pill tone="slate">{category.updatedAt}</Pill>
                      </div>

                      <div style={{marginTop: '0.85rem'}}>
                        <ScoreBar score={result.score} />
                      </div>

                      <p style={laneThesis}>{category.thesis}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <aside style={detailColumn}>
              <div style={detailShell}>
                <div style={detailHeader}>
                  <div>
                    <div style={sectionLabel}>selected lane</div>
                    <h2 style={detailTitle}>{selected.category.title}</h2>
                  </div>
                  <div style={detailPills}>
                    <Pill tone={getBandTone(selected.result.score)}>{selected.result.label}</Pill>
                    <Pill tone="slate">{selected.category.symbol}</Pill>
                  </div>
                </div>

                <div style={detailTopGrid}>
                  <div style={detailCard}>
                    <div style={smallHeading}>why it looks this way</div>
                    <p style={detailCopy}>{selected.category.thesis}</p>
                    <div style={indicatorList}>
                      {selected.result.details.map((row) => (
                        <IndicatorRow key={row.key} label={row.label} value={formatIndicatorValue(row)} score={row.score} weight={row.weight} note={row.note} />
                      ))}
                    </div>
                  </div>

                  <div style={detailCard}>
                    <div style={smallHeading}>what is in scope</div>
                    <ul style={bulletList}>
                      {selected.category.watchItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>

                    <div style={{marginTop: '1rem'}}>
                      <div style={smallHeading}>setup</div>
                      <div style={factList}>
                        <MiniFact label="signal type" value="weekly / long-term / low-noise" />
                        <MiniFact label="primary source" value={selected.category.source} />
                        <MiniFact label="next drill-down" value={selected.category.drillDownHint} />
                        <MiniFact label="score view" value={`${selected.result.score}/100 • ${scoreBandDescription(selected.result.score)}`} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <section style={footerCard}>
                <div style={smallHeading}>scoring rules</div>
                <div style={rulesGrid}>
                  <Rule text="200D and 200W MA are treated as cheap-vs-trend signals" />
                  <Rule text="weekly RSI stays long-term so it does not flicker every day" />
                  <Rule text="drawdown from ATH rewards real discounts without chasing collapse" />
                  <Rule text="relative volume checks whether the move has actual participation" />
                  <Rule text="1Y change catches full-cycle stretch without becoming the whole score" />
                </div>
              </section>
            </aside>
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
      <div style={summaryValue}>{value}</div>
      <div style={summaryNote}>{note}</div>
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
    slate: {background: 'rgba(255, 255, 255, 0.04)', color: 'var(--ifm-font-color-base)', borderColor: 'rgba(255,255,255,0.08)'},
  };

  return <span style={{...pillBase, ...stylesByTone[tone]}}>{children}</span>;
}

function MiniFact({label, value}: {label: string; value: string}) {
  return (
    <div style={miniFactRow}>
      <span style={miniFactLabel}>{label}</span>
      <strong style={miniFactValue}>{value}</strong>
    </div>
  );
}

function IndicatorRow({label, value, score, weight, note}: {label: string; value: string; score: number; weight: number; note: string}) {
  return (
    <div style={indicatorRow}>
      <div style={indicatorTop}>
        <div>
          <div style={indicatorLabel}>{label}</div>
          <div style={indicatorNote}>{note}</div>
        </div>
        <div style={indicatorValueBlock}>
          <div style={{...indicatorValue, color: scoreColor(score)}}>{value}</div>
          <div style={indicatorWeight}>{weight}% weight</div>
        </div>
      </div>
      <div style={{marginTop: '0.55rem'}}>
        <ScoreBar score={score} compact />
      </div>
    </div>
  );
}

function Rule({text}: {text: string}) {
  return <div style={ruleItem}>• {text}</div>;
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

const pageShell: React.CSSProperties = {
  padding: '2rem 0 4rem',
  background: 'linear-gradient(180deg, #07070d 0%, #090912 100%)',
  color: '#e8e4dc',
};

const heroCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 24,
  padding: '1.25rem',
  boxShadow: '0 18px 50px rgba(0,0,0,0.28)',
};

const heroTopRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '1rem',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
};

const heroChips: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
};

const heroTitle: React.CSSProperties = {
  margin: '0.15rem 0 0.4rem',
  fontSize: 'clamp(2rem, 4vw, 3.1rem)',
  lineHeight: 1.05,
  letterSpacing: '-0.04em',
};

const heroCopy: React.CSSProperties = {
  margin: 0,
  color: '#a7a19a',
  lineHeight: 1.6,
  maxWidth: 760,
};

const sectionLabel: React.CSSProperties = {
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#b6b1a8',
  fontWeight: 800,
  marginBottom: '0.35rem',
};

const smallHeading: React.CSSProperties = {
  ...sectionLabel,
  marginBottom: '0.55rem',
};

const summaryGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '0.9rem',
  marginTop: '1rem',
};

const summaryTile: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 18,
  padding: '0.95rem',
  boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
};

const summaryValue: React.CSSProperties = {
  fontSize: '1.45rem',
  fontWeight: 800,
  marginTop: '0.3rem',
};

const summaryNote: React.CSSProperties = {
  color: '#a7a19a',
  marginTop: '0.15rem',
  lineHeight: 1.45,
};

const contentGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.1fr 0.95fr',
  gap: '1rem',
  marginTop: '1rem',
  alignItems: 'start',
};

const laneColumn: React.CSSProperties = {
  minWidth: 0,
};

const laneList: React.CSSProperties = {
  display: 'grid',
  gap: '0.9rem',
};

const laneCard: React.CSSProperties = {
  textAlign: 'left',
  width: '100%',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 20,
  padding: '1rem',
  cursor: 'pointer',
  color: 'inherit',
  boxShadow: '0 12px 36px rgba(0,0,0,0.20)',
  transition: 'transform 120ms ease, border-color 120ms ease, background 120ms ease',
};

const laneCardActive: React.CSSProperties = {
  borderColor: 'rgba(255, 209, 102, 0.35)',
  background: 'rgba(255, 209, 102, 0.06)',
  transform: 'translateY(-1px)',
};

const laneHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '0.75rem',
  alignItems: 'flex-start',
};

const laneIdentity: React.CSSProperties = {
  display: 'flex',
  gap: '0.85rem',
  alignItems: 'center',
  minWidth: 0,
  flex: 1,
};

const laneIcon: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: 16,
  display: 'grid',
  placeItems: 'center',
  fontSize: '1.3rem',
  fontWeight: 800,
  background: 'linear-gradient(135deg, rgba(255,209,102,0.18), rgba(255,255,255,0.03))',
  border: '1px solid rgba(255,255,255,0.08)',
  flexShrink: 0,
};

const laneSource: React.CSSProperties = {
  fontSize: '0.78rem',
  color: '#a7a19a',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: 800,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const laneTitle: React.CSSProperties = {
  fontSize: '1.14rem',
  fontWeight: 800,
  marginTop: '0.1rem',
};

const laneSubtitle: React.CSSProperties = {
  color: '#a7a19a',
  fontSize: '0.93rem',
  lineHeight: 1.45,
  marginTop: '0.15rem',
};

const laneScoreBlock: React.CSSProperties = {
  textAlign: 'right',
  flexShrink: 0,
};

const laneScore: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: 900,
  lineHeight: 1,
};

const laneScoreLabel: React.CSSProperties = {
  color: '#a7a19a',
  fontSize: '0.8rem',
  marginTop: '0.2rem',
};

const laneMetaRow: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  flexWrap: 'wrap',
  marginTop: '0.85rem',
};

const laneThesis: React.CSSProperties = {
  margin: '0.8rem 0 0',
  color: '#a7a19a',
  lineHeight: 1.55,
};

const detailColumn: React.CSSProperties = {
  minWidth: 0,
};

const detailShell: React.CSSProperties = {
  position: 'sticky',
  top: '1rem',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 22,
  padding: '1rem',
  boxShadow: '0 12px 40px rgba(0,0,0,0.20)',
};

const detailHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '1rem',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
};

const detailTitle: React.CSSProperties = {
  margin: '0.1rem 0 0',
  fontSize: '1.4rem',
};

const detailPills: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
};

const detailTopGrid: React.CSSProperties = {
  display: 'grid',
  gap: '1rem',
  marginTop: '1rem',
};

const detailCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 18,
  padding: '1rem',
};

const detailCopy: React.CSSProperties = {
  margin: '0.1rem 0 0',
  color: '#a7a19a',
  lineHeight: 1.6,
};

const indicatorList: React.CSSProperties = {
  display: 'grid',
  gap: '0.65rem',
  marginTop: '1rem',
};

const indicatorRow: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: '0.85rem',
  background: 'rgba(255,255,255,0.02)',
};

const indicatorTop: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '0.75rem',
  alignItems: 'center',
};

const indicatorLabel: React.CSSProperties = {
  fontWeight: 800,
};

const indicatorNote: React.CSSProperties = {
  color: '#a7a19a',
  fontSize: '0.88rem',
  lineHeight: 1.45,
};

const indicatorValueBlock: React.CSSProperties = {
  textAlign: 'right',
};

const indicatorValue: React.CSSProperties = {
  fontWeight: 900,
};

const indicatorWeight: React.CSSProperties = {
  color: '#a7a19a',
  fontSize: '0.8rem',
};

const bulletList: React.CSSProperties = {
  margin: '0.5rem 0 0',
  paddingLeft: '1.2rem',
  color: '#a7a19a',
  lineHeight: 1.7,
};

const factList: React.CSSProperties = {
  display: 'grid',
  gap: '0.55rem',
  marginTop: '0.55rem',
};

const miniFactRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '0.75rem',
  paddingBottom: '0.45rem',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
};

const miniFactLabel: React.CSSProperties = {
  color: '#a7a19a',
};

const miniFactValue: React.CSSProperties = {
  textAlign: 'right',
};

const footerCard: React.CSSProperties = {
  marginTop: '1rem',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 22,
  padding: '1rem',
};

const rulesGrid: React.CSSProperties = {
  display: 'grid',
  gap: '0.5rem',
  color: '#a7a19a',
  lineHeight: 1.6,
  marginTop: '0.4rem',
};

const ruleItem: React.CSSProperties = {
  padding: '0.2rem 0',
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

const eyebrow: React.CSSProperties = {
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#a7a19a',
  fontWeight: 800,
};
