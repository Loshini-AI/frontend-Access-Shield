import { useCallback, useEffect, useState } from 'react';
import { Play, RefreshCw, RotateCcw } from 'lucide-react';
import {
  runAudit, getFindings, getEvidence, getRecommendations, injectEvent, resetDemo,
  type Finding,
} from '@/services/api';

interface Snap {
  score: number | null;
  total: number;
  high: number;
  focus: Finding | null;
  used: string[];
  unused: string[];
  rec: string;
  res: string;
  conf: number | null;
}

const ACTIONS = [
  's3:DeleteObject', 's3:GetObject', 's3:PutObject', 's3:ListBucket',
  'ec2:TerminateInstances', 'ec2:StartInstances', 'iam:PassRole',
  'lambda:InvokeFunction', 'rds:DescribeDBInstances',
];
const SVC: Record<string, string> = { s3: 'S3', ec2: 'EC2', iam: 'IAM', lambda: 'Lambda', rds: 'RDS' };

async function snap(u: string, score: number | null): Promise<Snap> {
  const [f, r] = await Promise.all([getFindings(), getRecommendations()]);
  const mine = f.filter((x) => x.user_id === u);
  const focus = mine.find((x) => x.finding_type === 'WILDCARD_ACTION') ?? mine[0] ?? null;
  let used: string[] = [];
  let unused: string[] = [];
  if (focus) {
    const e = await getEvidence(focus.id);
    used = e.observed_usage;
    unused = e.unused_actions;
  }
  const rec = focus ? r.find((x) => x.finding_id === focus.id) : undefined;
  return {
    score,
    total: mine.length,
    high: mine.filter((x) => x.severity === 'CRITICAL' || x.severity === 'HIGH').length,
    focus,
    used,
    unused,
    rec: rec?.recommended_action ?? '-',
    res: rec?.recommended_resource ?? '-',
    conf: rec?.confidence ?? null,
  };
}

const chip = (t: string, c: string) => (
  <code key={t} style={{ display: 'inline-block', margin: '2px 6px 2px 0', padding: '2px 8px', borderRadius: 6, background: c + '22', color: c }}>{t}</code>
);

function Card({ title, s }: { title: string; s: Snap | null }) {
  return (
    <div style={{ flex: '1 1 280px', background: '#0a1428', border: '1px solid #1b3152', borderRadius: 12, padding: 16 }}>
      <small className="dim">{title}</small>
      {!s ? <p className="dim">Run the scenario to see the result.</p> : (
        <>
          <div style={{ display: 'flex', gap: 22, margin: '8px 0 12px', flexWrap: 'wrap' }}>
            <div><b style={{ fontSize: 26 }}>{s.score ?? '-'}</b><br /><small className="dim">posture score</small></div>
            <div><b style={{ fontSize: 26 }}>{s.total}</b><br /><small className="dim">findings</small></div>
            <div><b style={{ fontSize: 26 }}>{s.high}</b><br /><small className="dim">high or critical</small></div>
          </div>
          <small className="dim">ACTUALLY USED</small>
          <div>{s.used.length ? s.used.map((t) => chip(t, '#00d68f')) : <span className="dim">none</span>}</div>
          <small className="dim">GRANTED BUT NEVER USED ({s.unused.length})</small>
          <div>{s.unused.length ? s.unused.slice(0, 6).map((t) => chip(t, '#ff4757')) : <span className="dim">none listed</span>}</div>
          <small className="dim">RECOMMENDED</small>
          <div>{s.rec.split(',').map((t) => t.trim()).filter(Boolean).map((t) => chip(t, '#168bff'))}</div>
          <small className="dim">Scope: {s.res}{s.conf !== null ? ` | confidence ${s.conf}%` : ''}</small>
        </>
      )}
    </div>
  );
}

export default function LiveScenario() {
  const [users, setUsers] = useState<string[]>([]);
  const [user, setUser] = useState('usr-alice');
  const [action, setAction] = useState('s3:DeleteObject');
  const [resource, setResource] = useState('arn:aws:s3:::production-data/*');
  const [score, setScore] = useState<number | null>(null);
  const [before, setBefore] = useState<Snap | null>(null);
  const [after, setAfter] = useState<Snap | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const refresh = useCallback(async (u: string) => {
    setBusy(true); setErr(null);
    try {
      const a = await runAudit();
      setScore(a.least_privilege_score);
      const f = await getFindings();
      const ids = [...new Set(f.map((x) => x.user_id))].sort();
      setUsers(ids);
      const pick = ids.includes(u) ? u : ids[0] ?? u;
      setUser(pick);
      setBefore(await snap(pick, a.least_privilege_score));
      setAfter(null);
    } catch (e) { setErr(e instanceof Error ? e.message : 'Backend unreachable'); }
    finally { setBusy(false); }
  }, []);
  useEffect(() => { refresh('usr-alice'); }, [refresh]);

  const run = async () => {
    setBusy(true); setErr(null);
    try {
      setBefore(await snap(user, score));
      await injectEvent({ user_id: user, service: SVC[action.split(':')[0]] ?? 'S3', action, resource });
      const a = await runAudit();
      setScore(a.least_privilege_score);
      setAfter(await snap(user, a.least_privilege_score));
    } catch (e) { setErr(e instanceof Error ? e.message : 'Scenario failed'); }
    finally { setBusy(false); }
  };

  const reset = async () => {
    setBusy(true); setErr(null);
    try { await resetDemo(); await refresh(user); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Reset failed'); setBusy(false); }
  };

  const added = after && before ? after.used.filter((x) => !before.used.includes(x)) : [];
  const sel = { padding: 8, borderRadius: 8, border: '1px solid #1b3152', background: '#0a1428', color: '#f5f9ff' } as const;

  return (
    <section className="panel panel-box" style={{ marginBottom: 14 }}>
      <div className="panel-head"><div>
        <h3>Live backend scenario</h3>
        <p>Adds a real event, re-runs the audit engine, and shows what changed</p>
      </div></div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', margin: '8px 0 14px' }}>
        <label style={{ display: 'grid', gap: 4, fontSize: 12 }}>Account
          <select style={sel} value={user} onChange={(e) => { setUser(e.target.value); snap(e.target.value, score).then((s) => { setBefore(s); setAfter(null); }); }}>
            {(users.length ? users : [user]).map((u) => <option key={u}>{u}</option>)}
          </select></label>
        <label style={{ display: 'grid', gap: 4, fontSize: 12 }}>Action
          <select style={sel} value={action} onChange={(e) => setAction(e.target.value)}>
            {ACTIONS.map((a) => <option key={a}>{a}</option>)}
          </select></label>
        <label style={{ display: 'grid', gap: 4, fontSize: 12, flex: '1 1 220px' }}>Resource
          <input style={sel} value={resource} onChange={(e) => setResource(e.target.value)} /></label>
        <button className="btn btn-primary" disabled={busy} onClick={run} data-testid="button-live-run"><Play size={15} />{busy ? 'Working' : 'Add event and re-audit'}</button>
        <button className="btn btn-secondary" disabled={busy} onClick={reset} data-testid="button-live-reset"><RotateCcw size={15} />Reset to clean data</button>
        <button className="btn btn-quiet" disabled={busy} onClick={() => refresh(user)} aria-label="Refresh"><RefreshCw size={15} /></button>
      </div>
      {err && <p role="alert" style={{ color: '#ff8a94' }}>{err}</p>}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <Card title="BEFORE" s={before} />
        <Card title={after ? `AFTER ${action}` : 'AFTER'} s={after} />
      </div>
      {after && (
        <p style={{ marginTop: 12 }}>
          {added.length
            ? <>The audit now sees <b>{added.join(', ')}</b> as used by {user}, so the recommendation keeps it.</>
            : <>No new used action for {user}. If the action was already in the logs, press <b>Reset to clean data</b> and run it again.</>}
        </p>
      )}
    </section>
  );
}