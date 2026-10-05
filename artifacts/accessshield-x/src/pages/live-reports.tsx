import { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { getFindings, getRecommendations, getReport, type Finding, type Recommendation } from '@/services/api';
import { Head, Box, Err, sev, save, msg } from '@/pages/live-ui';

export default function LiveReports() {
  const [fs, setFs] = useState<Finding[]>([]);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const [f, r] = await Promise.all([getFindings(), getRecommendations()]);
        setFs(f); setRecs(r);
        if (!f.length) { setErr('No findings yet. Run an audit first.'); return; }
        const id = f[0].id.replace(/^FIND-/, '').replace(/-\d+$/, '');
        try { setReport(await getReport(id)); } catch { setReport(null); }
      } catch (e) { setErr(msg(e)); }
    })();
  }, []);
  const dist = useMemo(() => {
    const d: Record<string, number> = {};
    fs.forEach((f) => { d[f.severity] = (d[f.severity] ?? 0) + 1; });
    return d;
  }, [fs]);
  const accounts = useMemo(() => new Set(fs.map((f) => f.user_id)).size, [fs]);
  const summary = report && typeof report.executive_summary === 'string' ? report.executive_summary : null;
  const csv = () => save('accessshield-findings.csv', 'id,severity,account,type,action,resource,risk,confidence\n' +
    fs.map((f) => [f.id, f.severity, f.user_id, f.finding_type, f.action, f.resource, f.risk_score, f.confidence].join(',')).join('\n'), 'text/csv');
  const tiles: [string, string | number][] = [
    ['Findings', fs.length],
    ['Accounts affected', accounts],
    ['High or critical', (dist.CRITICAL ?? 0) + (dist.HIGH ?? 0)],
    ['Recommendations', recs.length],
    ['Pending', recs.filter((r) => r.status === 'Pending').length],
    ['Accepted', recs.filter((r) => r.status === 'Accepted').length],
  ];
  return (
    <>
      <Head eyebrow="REPORTING / AUDIT SUMMARY" title="Audit Report" sub="Summary of the latest audit, computed from the backend."
        actions={<>
          <button className="btn btn-secondary" disabled={!report} onClick={() => save('accessshield-report.json', JSON.stringify(report, null, 2), 'application/json')}><Download size={15} />Report JSON</button>
          <button className="btn btn-secondary" disabled={!fs.length} onClick={csv}><Download size={15} />Findings CSV</button>
        </>} />
      <Err m={err} />
      {summary && <Box title="Executive summary"><p>{summary}</p></Box>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 14 }}>
        {tiles.map(([k, v]) => (
          <div className="panel panel-box" key={k}><small className="dim">{k}</small><br /><b style={{ fontSize: 24 }}>{String(v)}</b></div>
        ))}
      </div>
      <Box title="Severity distribution">
        {Object.entries(dist).map(([k, v]) => <span key={k} style={{ marginRight: 14 }}>{sev(k)} <b>{v}</b></span>)}
      </Box>
      <Box title="Top findings by risk">
        <div className="table-scroll"><table>
          <thead><tr><th>SEVERITY</th><th>ACCOUNT</th><th>TYPE</th><th>PERMISSION</th><th>RISK</th></tr></thead>
          <tbody>{[...fs].sort((a, b) => b.risk_score - a.risk_score).slice(0, 10).map((f) => (
            <tr key={f.id}><td>{sev(f.severity)}</td><td>{f.user_id}</td><td>{f.finding_type.replaceAll('_', ' ')}</td><td className="mono">{f.action}</td><td>{f.risk_score}</td></tr>
          ))}</tbody>
        </table></div>
      </Box>
    </>
  );
}