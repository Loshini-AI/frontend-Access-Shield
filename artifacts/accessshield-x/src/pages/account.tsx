import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { LogOut, RefreshCw, ServerCog, ShieldCheck, UserRound } from 'lucide-react';
import { signOut, currentUserEmail } from '@/lib/auth';
import { getHealth, getFindings, apiBaseUrl, type Health } from '@/services/api';

export function BackendStatus() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    const ping = () => getHealth().then(() => { if (live) setOk(true); }).catch(() => { if (live) setOk(false); });
    ping();
    const t = window.setInterval(ping, 15000);
    return () => { live = false; window.clearInterval(t); };
  }, []);
  const bad = ok === false;
  return (
    <div className="secure-state" title={apiBaseUrl} style={bad ? { color: '#ff4757' } : undefined}>
      <span className="live-dot" style={bad ? { background: '#ff4757' } : undefined} />
      {ok === null ? 'CHECKING API' : ok ? 'BACKEND ONLINE' : 'BACKEND OFFLINE'}
    </div>
  );
}

function sessionStart(): string {
  try {
    const raw = sessionStorage.getItem('accessshield.session');
    if (!raw) return 'Unknown';
    const at = (JSON.parse(raw) as { at?: number }).at;
    return at ? new Date(at).toLocaleString() : 'Unknown';
  } catch { return 'Unknown'; }
}

export default function AccountPage() {
  const [, setLocation] = useLocation();
  const email = currentUserEmail() ?? 'analyst';
  const initials = email.slice(0, 2).toUpperCase();
  const [health, setHealth] = useState<Health | null>(null);
  const [ms, setMs] = useState<number | null>(null);
  const [findings, setFindings] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const test = useCallback(async () => {
    setBusy(true); setErr(null);
    try {
      const t0 = performance.now();
      const h = await getHealth();
      setMs(Math.round(performance.now() - t0));
      setHealth(h);
      setFindings((await getFindings()).length);
    } catch (e) {
      setHealth(null); setMs(null);
      setErr(e instanceof Error ? e.message : 'Backend unreachable');
    } finally { setBusy(false); }
  }, []);
  useEffect(() => { test(); }, [test]);

  const row = (k: string, v: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '9px 0', borderBottom: '1px solid #1b3152' }}>
      <span className="dim">{k}</span><b style={{ textAlign: 'right', wordBreak: 'break-all' }}>{v}</b>
    </div>
  );

  return (
    <>
      <div className="page-head fade-in">
        <div>
          <div className="eyebrow">ACCOUNT / SESSION AND CONNECTION</div>
          <h1>My Account</h1>
          <p>Your session, the backend connection, and what data this workspace analyses.</p>
        </div>
        <div className="head-actions">
          <button className="btn btn-secondary" onClick={() => { signOut(); setLocation('/welcome'); }} data-testid="button-account-sign-out"><LogOut size={15} />Sign out</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 14 }}>
        <section className="panel panel-box">
          <div className="panel-head"><div><h3>Profile</h3><p>Signed-in analyst</p></div><UserRound size={18} /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '10px 0 6px' }}>
            <div className="avatar" style={{ width: 52, height: 52, fontSize: 18 }}>{initials}</div>
            <div><b style={{ fontSize: 16 }}>{email}</b><br /><span className="dim">Security analyst</span></div>
          </div>
          {row('Role', 'Analyst (read-only audit)')}
          {row('Workspace', 'AccessShield X demo')}
          {row('Session started', sessionStart())}
          {row('Sign-in method', 'Demo gate, browser session')}
        </section>

        <section className="panel panel-box">
          <div className="panel-head">
            <div><h3>Backend connection</h3><p>Live check against the FastAPI service</p></div>
            <ServerCog size={18} />
          </div>
          <div style={{ margin: '8px 0' }}>
            <span className={`badge badge-${health ? 'green' : 'red'}`}>{health ? 'CONNECTED' : err ? 'UNREACHABLE' : 'CHECKING'}</span>
          </div>
          {row('API address', apiBaseUrl)}
          {row('Service', health?.service ?? '-')}
          {row('Version', health?.version ?? '-')}
          {row('Environment', health?.environment ?? '-')}
          {row('Response time', ms !== null ? `${ms} ms` : '-')}
          {row('Findings loaded', findings !== null ? String(findings) : '-')}
          {err && <p role="alert" style={{ color: '#ff8a94' }}>{err}</p>}
          <button className="btn btn-primary" style={{ marginTop: 12 }} disabled={busy} onClick={test} data-testid="button-test-connection"><RefreshCw size={15} />{busy ? 'Testing' : 'Test connection'}</button>
        </section>

        <section className="panel panel-box">
          <div className="panel-head"><div><h3>Data and scope</h3><p>What is analysed in this workspace</p></div><ShieldCheck size={18} /></div>
          <p>Analysis runs on <b>simulated access logs and IAM policies</b> in a bounded cloud-resource scenario. It is read-only and never changes cloud configuration.</p>
          <p className="dim" style={{ marginBottom: 4 }}>LIVE FROM THE BACKEND</p>
          <p style={{ marginTop: 0 }}>Run Audit, Findings, Account Analysis, and the Overview counters and score.</p>
          <p className="dim" style={{ marginBottom: 4 }}>STILL SAMPLE DATA</p>
          <p style={{ marginTop: 0 }}>Access Logs, IAM Policies, Recommendations, Policy Diff, Evidence, Simulator and Reports.</p>
        </section>

        <section className="panel panel-box">
          <div className="panel-head"><div><h3>Session security</h3><p>How sign-in works in this build</p></div></div>
          <p>Sign-in is a demonstration gate. The check runs in the browser and the session ends when this tab closes.</p>
          <p className="dim">Production use would need server-side authentication, tokens and role-based access on the API.</p>
        </section>
      </div>
    </>
  );
}