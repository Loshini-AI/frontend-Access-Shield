import { Fragment, useCallback, useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import { getPolicies, uploadFile, type PolicyRow } from '@/services/api';
import { Head, Box, Err, msg, sel } from '@/pages/live-ui';

export default function LivePolicies() {
  const [rows, setRows] = useState<PolicyRow[]>([]);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const load = useCallback(() => { getPolicies().then(setRows).catch((e) => setErr(msg(e))); }, []);
  useEffect(() => { load(); }, [load]);
  const up = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try { setErr(null); const r = await uploadFile('/api/policies/upload', f); setNote('Uploaded ' + String(r.saved_policies_count ?? '') + ' policies'); load(); }
    catch (x) { setErr(msg(x)); }
  };
  const shown = rows.filter((p) => !q || (p.policy_name + ' ' + p.user_id + ' ' + p.service).toLowerCase().includes(q.toLowerCase()));
  const wild = (p: PolicyRow) => p.permissions.some((x) => x.action.includes('*') || x.resource === '*');
  return (
    <>
      <Head eyebrow="IDENTITY GOVERNANCE / POLICY INVENTORY" title="IAM Policies" sub="Policies stored in the backend, with the statements each one grants."
        actions={<label className="btn btn-secondary upload-btn"><Upload size={15} />Upload policies (JSON)<input type="file" accept=".json" onChange={up} /></label>} />
      <Err m={err} />
      {note && <p className="dim">{note}. Run an audit to analyse them.</p>}
      <Box title={shown.length + ' policies'} sub={rows.filter(wild).length + ' use a wildcard action or resource'}>
        <input style={{ ...sel, width: '100%', marginBottom: 10 }} aria-label="Find a policy" placeholder="Find a policy or account..." value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="table-scroll"><table>
          <thead><tr><th>POLICY</th><th>ACCOUNT</th><th>SERVICE</th><th>STATEMENTS</th><th>WILDCARD</th><th /></tr></thead>
          <tbody>{shown.map((p) => (
            <Fragment key={p.id}>
              <tr>
                <td>{p.policy_name}</td><td>{p.user_id}</td><td>{p.service}</td><td>{p.permissions.length}</td>
                <td><span className={'badge badge-' + (wild(p) ? 'high' : 'green')}>{wild(p) ? 'YES' : 'NO'}</span></td>
                <td><button className="table-primary" onClick={() => setOpen(open === p.id ? null : p.id)}>{open === p.id ? 'Hide' : 'View'}</button></td>
              </tr>
              {open === p.id && (
                <tr><td colSpan={6}>
                  <pre style={{ background: '#0a1428', border: '1px solid #1b3152', borderRadius: 8, padding: 10, fontSize: 12, overflowX: 'auto' }}>
                    {JSON.stringify({ Version: '2012-10-17', Statement: p.permissions.map((x) => ({ Effect: x.effect, Action: x.action, Resource: x.resource })) }, null, 2)}
                  </pre>
                </td></tr>
              )}
            </Fragment>))}</tbody>
        </table></div>
      </Box>
    </>
  );
}