 "use client";
import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking"|"allowed"|"blocked">("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) { setStatus("allowed"); return; }
    supabase.auth.getSession().then(({data}) => {
      const user = data.session?.user;
      const owner = process.env.NEXT_PUBLIC_OWNER_EMAIL;
      if (user && (!owner || user.email?.toLowerCase() === owner.toLowerCase())) setStatus("allowed");
      else setStatus("blocked");
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const owner = process.env.NEXT_PUBLIC_OWNER_EMAIL;
      setStatus(session?.user && (!owner || session.user.email?.toLowerCase() === owner.toLowerCase()) ? "allowed" : "blocked");
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(e: React.FormEvent) {
    e.preventDefault(); if (!supabase) return;
    setBusy(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setBusy(false);
  }
  if (status === "checking") return <div className="login-card">Đang kiểm tra phiên đăng nhập…</div>;
  if (status === "allowed") return <>{children}</>;
  return <main className="app-shell">
    <header className="topbar"><div className="brand">thiệp cưới<span>.</span>studio</div></header>
    <form className="login-card" onSubmit={signIn}>
      <div className="eyebrow">Private workspace</div><h1>Đăng nhập Studio</h1>
      <p className="muted" style={{fontSize:13,lineHeight:1.7}}>Không gian thiết kế riêng của chủ website.</p>
      {!isSupabaseConfigured && <div className="notice">Studio đang chạy chế độ demo trên trình duyệt này. Cấu hình Supabase để bật đăng nhập và đồng bộ dữ liệu online.</div>}
      <div className="field"><label>Email quản trị</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
      <div className="field"><label>Mật khẩu</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
      {error && <p style={{color:"#b22",fontSize:12}}>{error}</p>}
      <button className="btn primary" style={{width:"100%"}} disabled={!isSupabaseConfigured || busy}>{busy ? "Đang đăng nhập…" : "Đăng nhập"}</button>
      <p className="editor-note">Tạo tài khoản chủ web trong Supabase Authentication → Users. Không bật đăng ký công khai.</p>
    </form>
  </main>;
}
