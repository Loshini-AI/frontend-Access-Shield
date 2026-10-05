import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { runAudit, getFindings, getEvidence, getRecommendations, type Finding, type Evidence, type Recommendation, type AuditResult } from '@/services/api';

const ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export default function AccountsPage() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [user, setUser] = useState<string | null>(null);
  const [fid, setFid] = useState<string | null>(null);
  const [ev, setEv] = useState<Evidence | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState('');

  const load = useCallback(async (run: boolean) => {
    setBusy(true); setErr(null);
    try {
      if (run) setAudit(await runAudit());
      const [f, r] = await Promise.all([getFindings(), getRecommendations()]);
      setFindings(f); setRecs(r);
    } catch (e) { setErr(e instanceof Error ? e.message : 'Failed to load'); }
    finally { setBusy(false); }
  }, []);
  useEffect(() => { load(false); }, [load]);

  useEffect(() => {
    if (!fid) { setEv(null); return; }
    getEvidence(fid).then(setEv).catch(() => setEv(null));
  }, [fid]);

  const accounts = useMemo(() => {
    const m = new Map<string, Finding[]>();
    findings.forEach((f) => m.set(f.user_id, [...(m.get(f.user_id) ?? []), f]));
    return [...m.entries()].map(([id, fs]) => ({
      id, fs,
      worst: ORDER.find((s) => fs.some((f) => f.severity === s)) ?? 'LOW',
      risk: Math.max(...fs.map((f) => f.risk_score)),
      high: fs.filter((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH').length,
    })).sort((a, b) => ORDER.indexOf(a.worst) - ORDER.indexOf(b.worst) || b.risk - a.risk);
  }, [findings]);

  const shown = accounts.filter((a) => !q || a.id.toLowerCase().includes(q.toLowerCase()));
  const sel = accounts.find((a) => a.id === user) ?? null;
  const recFor = (id: string) => recs.find((r) => r.finding_id === id);

  const policy = useMemo(() => {
    if (!sel) return null;
    const byRes = new Map<string, Set<string>>();
    sel.fs.forEach((f) => {
      const r = recFor(f.id);
      if (!r || !r.recommended_action || r.recommended_action.startsWith('NONE')) return;
      const set = byRes.get(r.recommended_resource) ?? new Set<string>();
      r.recommended_action.split(',').map((x) => x.trim()).filter(Boolean).forEach((a) => set.add(a));
      byRes.set(r.recommended_resource, set);
    });
    return { Version: '2012-10-17', Statement: [...byRes.entries()].map(([res, set]) => ({ Effect: 'Allow', Action: [...set].sort(), Resource: res })) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel, recs]);

  const chip = (t: string, c: string) => (
    <code key={t} style={{ display: 'inline-block', margin: '2px 6px 2px 0', padding: '2px 8px', borderRadius: 6, background: c + '22', color: c }}>{t}</code>
  );

  return (
    <>
      <div className="page-head fade-in">
        <div>
          <div className="eyebrow">ACCOUNT ANALYSIS / LIVE FROM AUDIT ENGINE</div>
          <h1>Account Risk Analysis</h1>
          <p>Rank accounts by exposure, then drill into the evidence and the least-privilege policy for each one.</p>
        </div>
        <div className="head-actions">
          <button className="btn btn-primary" disabled={busy} onClick={() => load(true)} data-testid="button-reanalyze"><RefreshCw size={15} />{busy ? 'Analysing' : 'Re-analyze'}</button>
        </div>
      </div>
      {err && <div className="panel panel-box" role="alert" style={{ color: '#ff8a94', marginBottom: 12 }}>{err}</div>}
      {audit && <div className="panel panel-box" style={{ marginBottom: 12 }}>Last analysis: score <b>{audit.least_privilege_score}</b> | {audit.users_analyzed} accounts | {audit.events_analyzed} events | {audit.findings_count} findings</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 14 }}>
        <section className="panel panel-box">
          <div className="panel-head"><div><h3>Accounts ({shown.length})</h3><p>Sorted by worst severity</p></div></div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find an account..." aria-label="Find an account" style={{ width: '100%', margin: '8px 0', padding: 8, borderRadius: 8, border: '1px solid #1b3152', background: '#0a1428', color: '#f5f9ff' }} />
          <div className="table-scroll"><table>
            <thead><tr><th>ACCOUNT</th><th>WORST</th><th>HIGH+</th><th>FINDINGS</th></tr></thead>
            <tbody>{shown.map((a) => (
              <tr key={a.id} style={a.id === user ? { background: '#168bff22' } : undefined}>
                <td><button className="table-primary" onClick={() => { setUser(a.id); setFid(null); }}>{a.id}</button></td>
                <td><span className={`badge badge-${a.worst.toLowerCase()}`}>{a.worst}</span></td>
                <td>{a.high}</td><td>{a.fs.length}</td>
              </tr>))}</tbody>
          </table></div>
          {!shown.length && !busy && <p className="dim">No findings yet. Click Re-analyze.</p>}
        </section>
        <section className="panel panel-box">
          {!sel ? <p className="dim">Select an account to see its findings, evidence and recommended policy.</p> : (
            <>
              <div className="panel-head"><div><h3>{sel.id}</h3><p>{sel.fs.length} findings | max risk {sel.risk} | {sel.high} high or critical</p></div></div>
              <div className="table-scroll"><table>
                <thead><tr><th>SEVERITY</th><th>TYPE</th><th>PERMISSION</th></tr></thead>
                <tbody>{sel.fs.map((f) => (
                  <tr key={f.id} style={f.id === fid ? { background: '#168bff22' } : undefined}>
                    <td><span className={`badge badge-${f.severity.toLowerCase()}`}>{f.severity}</span></td>
                    <td>{f.finding_type.replaceAll('_', ' ')}</td>
                    <td><button className="table-primary mono" onClick={() => setFid(f.id)}>{f.action}</button></td>
                  </tr>))}</tbody>
              </table></div>
              {fid && ev && (
                <div style={{ marginTop: 14 }}>
                  <b>Why it was flagged</b><p>{ev.why_flagged}</p>
                  <small className="dim">GRANTED</small><div><code>{ev.assigned_permission}</code></div>
                  <small className="dim">ACTUALLY USED</small><div>{ev.observed_usage.length ? ev.observed_usage.map((t) => chip(t, '#00d68f')) : <span className="dim">none</span>}</div>
                  <small className="dim">GRANTED BUT NEVER USED</small><div>{ev.unused_actions.length ? ev.unused_actions.map((t) => chip(t, '#ff4757')) : <span className="dim">none listed</span>}</div>
                  <small className="dim">RISK FACTORS</small><p>{ev.risk_factors.join('; ') || 'none'}</p>
                  {recFor(fid) && <p><b>Recommendation:</b> {recFor(fid)!.current_action} to <b>{recFor(fid)!.recommended_action}</b> on {recFor(fid)!.recommended_resource} (confidence {recFor(fid)!.confidence}%, risk reduction {recFor(fid)!.risk_reduction}%)</p>}
                </div>
              )}
              <div style={{ marginTop: 14 }}>
                <b>Least-privilege policy for {sel.id}</b>
                <pre style={{ background: '#0a1428', border: '1px solid #1b3152', borderRadius: 8, padding: 10, overflowX: 'auto', fontSize: 12 }}>{JSON.stringify(policy, null, 2)}</pre>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}