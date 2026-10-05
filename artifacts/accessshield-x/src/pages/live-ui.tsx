import type { ReactNode } from 'react';

export const msg = (e: unknown) => (e instanceof Error ? e.message : 'Request failed');
export const sel = { padding: 8, borderRadius: 8, border: '1px solid #1b3152', background: '#0a1428', color: '#f5f9ff' } as const;

export function Head({ eyebrow, title, sub, actions }: { eyebrow: string; title: string; sub: string; actions?: ReactNode }) {
  return (
    <div className="page-head fade-in">
      <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{sub}</p></div>
      {actions && <div className="head-actions">{actions}</div>}
    </div>
  );
}
export function Box({ title, sub, children }: { title?: string; sub?: string; children: ReactNode }) {
  return (
    <section className="panel panel-box" style={{ marginBottom: 14 }}>
      {title && <div className="panel-head"><div><h3>{title}</h3>{sub && <p>{sub}</p>}</div></div>}
      {children}
    </section>
  );
}
export const Err = ({ m }: { m: string | null }) => (m ? <p role="alert" style={{ color: '#ff8a94' }}>{m}</p> : null);
export const sev = (s: string) => <span className={`badge badge-${s.toLowerCase()}`}>{s}</span>;
export const chip = (t: string, c: string) => (
  <code key={t} style={{ display: 'inline-block', margin: '2px 6px 2px 0', padding: '2px 8px', borderRadius: 6, background: c + '22', color: c }}>{t}</code>
);
export function Pager({ page, total, size, set }: { page: number; total: number; size: number; set: (n: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / size));
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10 }}>
      <button className="btn btn-secondary" disabled={page <= 1} onClick={() => set(page - 1)}>Previous</button>
      <span className="dim">Page {page} of {pages} | {total} records</span>
      <button className="btn btn-secondary" disabled={page >= pages} onClick={() => set(page + 1)}>Next</button>
    </div>
  );
}
export function save(name: string, content: string, type: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name; a.click(); URL.revokeObjectURL(a.href);
}