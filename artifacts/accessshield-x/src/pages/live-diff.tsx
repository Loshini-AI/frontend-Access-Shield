import { useEffect, useMemo, useState } from 'react';
import { getFindings, getPolicies, getRecommendations, type Finding, type PolicyRow, type Recommendation } from '@/services/api';
import { Head, Box, Err, msg, sel } from '@/pages/live-ui';

const pre = { background: '#0a1428', border: '1px solid #1b3152', borderRadius: 8, padding: 10, fontSize: 12, overflowX: 'auto' } as const;

export default function LiveDiff() {
  const [pols, setPols] = useState<PolicyRow[]>([]);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [fs, setFs] = useState<Finding[]>([]);
  const [user, setUser] = useState('');
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    Promise.all([getPolicies(), getRecommendations(), getFindings()]).then(([p, r, f]) => {
      setPols(p); setRecs(r); setFs(f);
      setUser(f.find((x) => x.user_id === 'usr-alice')?.user_id ?? f[0]?.user_id ?? '');
    }).catch((e) => setErr(msg(e)));
  }, []);
  const users = useMemo(() => [...new Set(fs.map((f) => f.user_id))].sort(), [fs]);
  const current = useMemo(() => ({
    Version: '2012-10-17',
    Statement: pols.filter((p) => p.user_id === user).flatMap((p) => p.permissions.map((x) => ({ Effect: x.effect, Action: x.action, Resource: x.resource }))),
  }), [pols, user]);
  const recommended = useMemo(() => {
    const ids = new Set(fs.filter((f) => f.user_id === user).map((f) => f.id));
    const byRes = new Map<string, Set<string>>();
    recs.filter((r) => ids.has(r.finding_id)).forEach((r) => {
      if (!r.recommended_action || r.recommended_action.startsWith('NONE')) return;
      const set = byRes.get(r.recommended_resource) ?? new Set<string>();
      r.recommended_action.split(',').map((x) => x.trim()).filter(Boolean).forEach((a) => set.add(a));
      byRes.set(r.recommended_resource, set);
    });
    return { Version: '2012-10-17', Statement: [...byRes.entries()].map(([res, set]) => ({ Effect: 'Allow', Action: [...set].sort(), Resource: res })) };
  }, [recs, fs, user]);
  const wild = (s: { Action: string | string[]; Resource: string }) =>
    (Array.isArray(s.Action) ? s.Action : [s.Action]).some((a) => a.includes('*')) || s.Resource === '*';
  return (
    <>
      <Head eyebrow="REMEDIATION / POLICY CHANGE" title="Policy Diff" sub="The policy an account holds today, next to the least-privilege policy built from its recommendations."
        actions={<select style={sel} value={user} onChange={(e) => setUser(e.target.value)} aria-label="Account">{users.map((u) => <option key={u}>{u}</option>)}</select>} />
      <Err m={err} />
      <p>Statements with a wildcard: <b>{current.Statement.filter(wild).length}</b> now, <b>{recommended.Statement.filter(wild).length}</b> after the change.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 14 }}>
        <Box title="Current policy" sub="Granted today"><pre style={pre}>{JSON.stringify(current, null, 2)}</pre></Box>
        <Box title="Recommended policy" sub="Built from observed usage"><pre style={pre}>{JSON.stringify(recommended, null, 2)}</pre></Box>
      </div>
    </>
  );
}