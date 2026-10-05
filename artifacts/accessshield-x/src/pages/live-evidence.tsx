import { useEffect, useMemo, useState } from 'react';
import { getFindings, getEvidence, type Evidence, type Finding } from '@/services/api';
import { Head, Box, Err, chip, msg, sel } from '@/pages/live-ui';

export default function LiveEvidence() {
  const [fs, setFs] = useState<Finding[]>([]);
  const [user, setUser] = useState('');
  const [fid, setFid] = useState('');
  const [ev, setEv] = useState<Evidence | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    getFindings().then((f) => { setFs(f); setUser(f.find((x) => x.user_id === 'usr-alice')?.user_id ?? f[0]?.user_id ?? ''); }).catch((e) => setErr(msg(e)));
  }, []);
  const users = useMemo(() => [...new Set(fs.map((f) => f.user_id))].sort(), [fs]);
  const mine = useMemo(() => fs.filter((f) => f.user_id === user), [fs, user]);
  useEffect(() => { setFid(mine[0]?.id ?? ''); }, [mine]);
  useEffect(() => {
    if (!fid) { setEv(null); return; }
    getEvidence(fid).then(setEv).catch((e) => setErr(msg(e)));
  }, [fid]);
  return (
    <>
      <Head eyebrow="EXPLAINABILITY / SUPPORTING EVIDENCE" title="Evidence" sub="Why each permission was flagged: what was granted, what was actually used, and how sure the engine is." />
      <Err m={err} />
      <Box>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select style={sel} value={user} onChange={(e) => setUser(e.target.value)} aria-label="Account">{users.map((u) => <option key={u}>{u}</option>)}</select>
          <select style={{ ...sel, flex: '1 1 260px' }} value={fid} onChange={(e) => setFid(e.target.value)} aria-label="Finding">
            {mine.map((f) => <option key={f.id} value={f.id}>{f.severity + ' | ' + f.finding_type.replaceAll('_', ' ') + ' | ' + f.action}</option>)}
          </select>
        </div>
      </Box>
      {ev && (
        <Box title="Evidence detail" sub={ev.finding_id}>
          <p><b>Why it was flagged.</b> {ev.why_flagged}</p>
          <small className="dim">GRANTED</small><div><code>{ev.assigned_permission}</code></div>
          <small className="dim">ACTUALLY USED</small><div>{ev.observed_usage.length ? ev.observed_usage.map((t) => chip(t, '#00d68f')) : <span className="dim">none</span>}</div>
          <small className="dim">GRANTED BUT NEVER USED</small><div>{ev.unused_actions.length ? ev.unused_actions.map((t) => chip(t, '#ff4757')) : <span className="dim">none listed</span>}</div>
          <small className="dim">RESOURCES SEEN</small><div>{ev.observed_resources.length ? ev.observed_resources.map((t) => chip(t, '#168bff')) : <span className="dim">none</span>}</div>
          <small className="dim">RISK FACTORS</small><p>{ev.risk_factors.join('; ') || 'none'}</p>
          <p><b>Confidence:</b> {ev.confidence}%</p>
          <p className="dim">{ev.recommendation_reasoning}</p>
        </Box>
      )}
    </>
  );
}