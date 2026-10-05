import { Link } from 'wouter';
import { ShieldCheck, FileSearch, Eye, Zap, Users, Layers, ArrowRight, Check, X } from 'lucide-react';

const css = `
.lp{background:#050b18;color:#f5f9ff;min-height:100vh;font-family:system-ui,Segoe UI,sans-serif}
.lp a{color:inherit;text-decoration:none}
.lp-wrap{max-width:1120px;margin:0 auto;padding:0 24px}
.lp-nav{display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid #1b3152;position:sticky;top:0;background:#050b18ee;backdrop-filter:blur(8px);z-index:5}
.lp-brand{display:flex;align-items:center;gap:10px;font-weight:800;letter-spacing:.04em}
.lp-brand span{color:#168bff}
.lp-links{display:flex;gap:22px;color:#8b9bb4;font-size:14px}
.lp-links a:hover{color:#fff}
.lp-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:8px;font-weight:600;border:1px solid #1b3152;background:#0a1428;cursor:pointer;color:#f5f9ff}
.lp-btn.p{background:#168bff;border-color:#168bff;color:#fff}
.lp-btn:focus-visible{outline:3px solid #ffb020;outline-offset:2px}
.lp-hero{display:grid;grid-template-columns:1.1fr .9fr;gap:40px;align-items:center;padding:72px 0 48px}
.lp-eyebrow{color:#00d68f;font-size:12px;letter-spacing:.2em;font-weight:700}
.lp h1{font-size:46px;line-height:1.1;margin:14px 0;font-weight:800}
.lp h1 em{font-style:normal;color:#168bff}
.lp-sub{color:#8b9bb4;font-size:17px;max-width:540px}
.lp-card{background:#0a1428;border:1px solid #1b3152;border-radius:14px;padding:20px}
.lp-code{font-family:ui-monospace,Consolas,monospace;font-size:13px;border-radius:6px;padding:4px 8px;display:inline-block;margin:2px 4px 2px 0}
.lp-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin:24px 0 64px}
.lp-stat{background:#0a1428;border:1px solid #1b3152;border-radius:12px;padding:18px}
.lp-stat b{font-size:30px;display:block}
.lp-stat small{color:#8b9bb4}
.lp h2{font-size:30px;margin:0 0 8px}
.lp-sec{padding:40px 0}
.lp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin-top:22px}
.lp-num{width:34px;height:34px;border-radius:50%;background:#168bff22;color:#168bff;display:grid;place-items:center;font-weight:800;margin-bottom:10px}
.lp table{width:100%;border-collapse:collapse;margin-top:18px}
.lp th,.lp td{padding:12px 14px;border-bottom:1px solid #1b3152;text-align:left}
.lp th{color:#8b9bb4;font-size:12px;letter-spacing:.1em}
.lp-cta{text-align:center;background:#0a1428;border:1px solid #1b3152;border-radius:16px;padding:48px 24px;margin:40px 0}
.lp-foot{border-top:1px solid #1b3152;padding:24px;color:#8b9bb4;text-align:center;font-size:13px}
@media(max-width:820px){.lp-hero{grid-template-columns:1fr}.lp h1{font-size:34px}.lp-links{display:none}}
`;

const STEPS = [
  ['Ingest', 'Upload IAM policies and access logs, or use the simulated demo dataset.'],
  ['Compare', 'Each granted permission is matched against what was actually used.'],
  ['Detect', 'Unused, overbroad, wildcard and destructive grants are flagged and scored.'],
  ['Recommend', 'Get a narrowed action and resource, with confidence and risk reduction.'],
];
const FEATURES = [
  [FileSearch, 'Logs vs policies', 'Cross-references observed activity with every policy statement.'],
  [ShieldCheck, 'Least-privilege fixes', 'Replaces wildcards with the exact actions each account needs.'],
  [Eye, 'Evidence for every finding', 'Used and unused actions, risk factors and confidence, per finding.'],
  [Zap, 'Adapts to new activity', 'Inject an event and the audit re-runs, updating the advice live.'],
  [Users, 'Per-account analysis', 'Rank accounts by exposure and generate a policy for each one.'],
  [Layers, 'Prioritised risk', 'Critical, high, medium and low findings with a 0-100 posture score.'],
] as const;
const ROWS: [string, boolean, boolean][] = [
  ['Reads policy text', true, true],
  ['Compares with real usage', false, true],
  ['Finds unused permissions', false, true],
  ['Suggests a narrowed policy', false, true],
  ['Evidence and confidence per finding', false, true],
  ['Reacts to new events', false, true],
];

export default function Landing() {
  return (
    <div className="lp">
      <style>{css}</style>
      <nav className="lp-nav">
        <div className="lp-brand"><ShieldCheck size={22} color="#168bff" aria-hidden="true" />ACCESS<span>SHIELD</span> X</div>
        <div className="lp-links"><a href="#how">How it works</a><a href="#features">Features</a><a href="#compare">Compare</a></div>
        <Link href="/sign-in"><span className="lp-btn p" role="button">Sign in</span></Link>
      </nav>
      <div className="lp-wrap">
        <section className="lp-hero">
          <div>
            <div className="lp-eyebrow">INTELLIGENT IAM LEAST-PRIVILEGE AUDITOR</div>
            <h1>Find the permissions nobody uses, <em>before an attacker does.</em></h1>
            <p className="lp-sub">AccessShield X compares cloud access logs with IAM policies and produces narrowed, evidence-backed recommendations for every account.</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
              <Link href="/sign-in"><span className="lp-btn p" role="button">Open the dashboard <ArrowRight size={16} /></span></Link>
              <a href="#how"><span className="lp-btn" role="button">See how it works</span></a>
            </div>
          </div>
          <div className="lp-card" aria-label="Example finding">
            <div style={{ color: '#8b9bb4', fontSize: 12, marginBottom: 10 }}>EXAMPLE FROM THE DEMO DATASET</div>
            <b>usr-alice</b>
            <p style={{ margin: '14px 0 4px', color: '#8b9bb4', fontSize: 12 }}>GRANTED</p>
            <span className="lp-code" style={{ background: '#ff475722', color: '#ff4757' }}>s3:*</span>
            <span className="lp-code" style={{ background: '#ff475722', color: '#ff4757' }}>Resource: *</span>
            <p style={{ margin: '14px 0 4px', color: '#8b9bb4', fontSize: 12 }}>RECOMMENDED</p>
            <span className="lp-code" style={{ background: '#00d68f22', color: '#00d68f' }}>s3:GetObject</span>
            <span className="lp-code" style={{ background: '#00d68f22', color: '#00d68f' }}>s3:PutObject</span>
            <span className="lp-code" style={{ background: '#00d68f22', color: '#00d68f' }}>production-data/*</span>
            <p style={{ margin: '16px 0 0', color: '#8b9bb4', fontSize: 13 }}>Confidence 95% | risk reduction 63.8%</p>
          </div>
        </section>
        <div className="lp-stats">
          {[['30', 'IAM policies'], ['20', 'accounts'], ['500', 'access events'], ['0-100', 'posture score']].map(([n, l]) => (
            <div className="lp-stat" key={l}><b>{n}</b><small>{l} (demo dataset)</small></div>
          ))}
        </div>
        <section className="lp-sec" id="how">
          <h2>How it works</h2>
          <div className="lp-grid">{STEPS.map(([t, d], i) => (
            <div className="lp-card" key={t}><div className="lp-num">{i + 1}</div><b>{t}</b><p style={{ color: '#8b9bb4', margin: '6px 0 0' }}>{d}</p></div>
          ))}</div>
        </section>
        <section className="lp-sec" id="features">
          <h2>What you get</h2>
          <div className="lp-grid">{FEATURES.map(([Icon, t, d]) => (
            <div className="lp-card" key={t}><Icon size={20} color="#168bff" aria-hidden="true" /><b style={{ display: 'block', marginTop: 8 }}>{t}</b><p style={{ color: '#8b9bb4', margin: '6px 0 0' }}>{d}</p></div>
          ))}</div>
        </section>
        <section className="lp-sec" id="compare">
          <h2>Versus a static policy scan</h2>
          <div className="lp-card" style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr><th>CAPABILITY</th><th>STATIC SCAN</th><th>ACCESSSHIELD X</th></tr></thead>
              <tbody>{ROWS.map(([c, a, b]) => (
                <tr key={c}><td>{c}</td>
                  <td>{a ? <Check size={16} color="#00d68f" aria-label="Yes" /> : <X size={16} color="#ff4757" aria-label="No" />}</td>
                  <td>{b ? <Check size={16} color="#00d68f" aria-label="Yes" /> : <X size={16} color="#ff4757" aria-label="No" />}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </section>
        <section className="lp-sec">
          <div className="lp-card"><b>Scope</b><p style={{ color: '#8b9bb4', margin: '6px 0 0' }}>This build analyses simulated access logs and IAM policies in a bounded cloud-resource scenario. It is read-only and never changes cloud configuration.</p></div>
        </section>
        <section className="lp-cta">
          <h2>See your least-privilege posture in seconds</h2>
          <p style={{ color: '#8b9bb4' }}>Run an audit, open any account, and review the evidence behind each recommendation.</p>
          <Link href="/sign-in"><span className="lp-btn p" role="button">Sign in to start</span></Link>
        </section>
      </div>
      <div className="lp-foot">AccessShield X | Least privilege, continuously verified</div>
    </div>
  );
}