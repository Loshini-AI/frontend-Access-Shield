import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { ShieldCheck, Eye, EyeOff, ArrowLeft, Activity, FileSearch, Zap } from 'lucide-react';
import { signIn, isSignedIn } from '@/lib/auth';

const DEMO_EMAIL: string = import.meta.env.VITE_DEMO_EMAIL || 'analyst@accessshield.x';
const DEMO_PASSWORD: string = import.meta.env.VITE_DEMO_PASSWORD || 'shield-demo-2026';

const css = `
.si{min-height:100vh;display:grid;grid-template-columns:1.05fr .95fr;background:#050b18;color:#f5f9ff;font-family:system-ui,Segoe UI,sans-serif}
.si-left{padding:48px;display:flex;flex-direction:column;justify-content:space-between;background:radial-gradient(circle at 20% 20%,#168bff33,transparent 55%),radial-gradient(circle at 80% 90%,#6c5ce733,transparent 50%),#07122a;border-right:1px solid #1b3152}
.si-brand{display:flex;align-items:center;gap:10px;font-weight:800;letter-spacing:.04em;font-size:18px}
.si-brand span{color:#168bff}
.si-left h2{font-size:34px;line-height:1.15;margin:0 0 14px}
.si-left p{color:#8b9bb4;max-width:420px}
.si-pt{display:flex;gap:12px;align-items:flex-start;margin-top:18px;color:#cfe0f7}
.si-pt i{width:34px;height:34px;border-radius:8px;background:#168bff22;display:grid;place-items:center;flex:none}
.si-right{display:grid;place-items:center;padding:32px}
.si-form{width:100%;max-width:380px}
.si-form h1{margin:0 0 6px;font-size:26px}
.si-form label{display:block;margin:16px 0 6px;font-size:13px;color:#8b9bb4}
.si-in{width:100%;padding:12px 14px;border-radius:8px;border:1px solid #1b3152;background:#0a1428;color:#f5f9ff;font-size:15px}
.si-in:focus{outline:3px solid #168bff66;border-color:#168bff}
.si-pw{position:relative}
.si-eye{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:0;color:#8b9bb4;cursor:pointer;padding:6px}
.si-btn{width:100%;margin-top:20px;padding:12px;border-radius:8px;border:0;background:#168bff;color:#fff;font-weight:700;font-size:15px;cursor:pointer;display:flex;justify-content:center;gap:8px;align-items:center}
.si-btn:disabled{opacity:.7}
.si-btn:focus-visible,.si-eye:focus-visible,.si-demo:focus-visible{outline:3px solid #ffb020;outline-offset:2px}
.si-demo{margin-top:14px;width:100%;padding:10px;border-radius:8px;border:1px dashed #1b3152;background:#0a1428;color:#8b9bb4;cursor:pointer}
.si-err{margin-top:14px;padding:10px 12px;border-radius:8px;background:#ff475722;color:#ff8a94;font-size:14px}
.si-spin{width:16px;height:16px;border:2px solid #fff6;border-top-color:#fff;border-radius:50%;animation:sis .7s linear infinite}
@keyframes sis{to{transform:rotate(360deg)}}
.si-back{display:inline-flex;gap:6px;align-items:center;color:#8b9bb4;margin-bottom:28px;text-decoration:none;font-size:14px}
@media(max-width:820px){.si{grid-template-columns:1fr}.si-left{display:none}}
`;

export default function SignIn() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (isSignedIn()) setLocation('/'); }, [setLocation]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    window.setTimeout(() => {
      if (signIn(email, password)) setLocation('/');
      else { setError('Incorrect email or password.'); setBusy(false); }
    }, 600);
  };

  return (
    <div className="si">
      <style>{css}</style>
      <aside className="si-left">
        <div className="si-brand"><ShieldCheck size={24} color="#168bff" aria-hidden="true" />ACCESS<span>SHIELD</span> X</div>
        <div>
          <h2>Least privilege, continuously verified.</h2>
          <p>Sign in to audit IAM permissions against real access activity.</p>
          <div className="si-pt"><i><Activity size={16} color="#168bff" /></i><span>Compare granted permissions with observed usage</span></div>
          <div className="si-pt"><i><FileSearch size={16} color="#168bff" /></i><span>See the evidence behind every finding</span></div>
          <div className="si-pt"><i><Zap size={16} color="#168bff" /></i><span>Get narrowed policies you can apply</span></div>
        </div>
        <small style={{ color: '#8b9bb4' }}>Simulated data | read-only analysis</small>
      </aside>
      <main className="si-right">
        <form className="si-form" onSubmit={submit}>
          <Link href="/welcome"><span className="si-back"><ArrowLeft size={15} />Back to home</span></Link>
          <h1>Welcome back</h1>
          <p style={{ color: '#8b9bb4', margin: 0 }}>Sign in to your analyst workspace.</p>
          <label htmlFor="email">Email</label>
          <input id="email" className="si-in" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <label htmlFor="password">Password</label>
          <div className="si-pw">
            <input id="password" className="si-in" type={show ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="si-eye" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
          {error && <div className="si-err" role="alert">{error}</div>}
          <button className="si-btn" type="submit" disabled={busy}>{busy && <span className="si-spin" />}{busy ? 'Signing in' : 'Sign in'}</button>
          <button type="button" className="si-demo" onClick={() => { setEmail(DEMO_EMAIL); setPassword(DEMO_PASSWORD); setError(null); }}>Use demo credentials</button>
        </form>
      </main>
    </div>
  );
}