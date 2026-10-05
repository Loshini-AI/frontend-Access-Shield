import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import { getLogs, getFacets, injectEvent, uploadFile, type Facets, type LogPage } from '@/services/api';
import { Head, Box, Err, Pager, msg, sel } from '@/pages/live-ui';

export default function LiveLogs() {
  const size = 15;
  const [page, setPage] = useState(1);
  const [user, setUser] = useState('');
  const [service, setService] = useState('');
  const [q, setQ] = useState('');
  const [data, setData] = useState<LogPage>({ total: 0, items: [] });
  const [facets, setFacets] = useState<Facets>({ users: [], services: [], statuses: [] });
  const [err, setErr] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    try { setErr(null); setData(await getLogs({ limit: size, offset: (page - 1) * size, user_id: user, service, q })); }
    catch (e) { setErr(msg(e)); }
  }, [page, user, service, q]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { getFacets().then(setFacets).catch(() => undefined); }, []);

  useEffect(() => {
    if (!live) return;
    const t = window.setInterval(async () => {
      try {
        const pool = (await getLogs({ limit: 50, offset: 0 })).items;
        if (!pool.length) return;
        const r = pool[Math.floor(Math.random() * pool.length)];
        await injectEvent({ user_id: r.user_id, service: r.service, action: r.action, resource: r.resource });
        setNote('Simulated event: ' + r.user_id + ' ' + r.action);
        await load();
      } catch (e) { setErr(msg(e)); }
    }, 4000);
    return () => window.clearInterval(t);
  }, [live, load]);

  const up = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      setErr(null);
      const r = await uploadFile('/api/logs/upload', f);
      setNote('Uploaded ' + String(r.saved_count ?? '') + ' events');
      setPage(1); await load();
    } catch (x) { setErr(msg(x)); }
  };

  return (
    <>
      <Head eyebrow="TELEMETRY / ACCESS ACTIVITY" title="Access Logs" sub="Observed activity from the backend database. New events change findings after the next audit."
        actions={<>
          <label className="btn btn-secondary upload-btn"><Upload size={15} />Upload logs (JSON)<input type="file" accept=".json" onChange={up} /></label>
          <button className={'btn ' + (live ? 'btn-primary' : 'btn-secondary')} onClick={() => setLive(!live)}>{live ? 'Stop live feed' : 'Start simulated live feed'}</button>
        </>} />
      <Err m={err} />
      {note && <p className="dim">{note}. Simulated traffic adds to the data. Use Reset on the Scenario Simulator page to restore it.</p>}
      <Box>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          <select style={sel} aria-label="Account" value={user} onChange={(e) => { setUser(e.target.value); setPage(1); }}><option value="">All accounts</option>{facets.users.map((u) => <option key={u}>{u}</option>)}</select>
          <select style={sel} aria-label="Service" value={service} onChange={(e) => { setService(e.target.value); setPage(1); }}><option value="">All services</option>{facets.services.map((u) => <option key={u}>{u}</option>)}</select>
          <input style={{ ...sel, flex: '1 1 200px' }} placeholder="Search action, resource, account..." aria-label="Search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
        <div className="table-scroll"><table>
          <thead><tr><th>TIME</th><th>ACCOUNT</th><th>SERVICE</th><th>ACTION</th><th>RESOURCE</th><th>STATUS</th></tr></thead>
          <tbody>{data.items.map((l) => (
            <tr key={l.id}>
              <td className="mono">{l.timestamp ? new Date(l.timestamp).toLocaleString() : '-'}</td>
              <td>{l.user_id}</td><td>{l.service}</td><td className="mono">{l.action}</td><td className="mono">{l.resource}</td>
              <td><span className={'badge badge-' + (l.status === 'SUCCESS' ? 'green' : 'red')}>{l.status ?? '-'}</span></td>
            </tr>))}</tbody>
        </table></div>
        <Pager page={page} total={data.total} size={size} set={setPage} />
      </Box>
    </>
  );
}