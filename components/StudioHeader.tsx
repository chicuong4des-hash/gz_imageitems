 "use client";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
export default function StudioHeader({ title, actions }: { title?: string; actions?: React.ReactNode }) {
  async function logout() { if (isSupabaseConfigured && supabase) { await supabase.auth.signOut(); location.href = "/dashboard"; } }
  return <header className="topbar">
    <Link className="brand" href="/dashboard">thiệp cưới<span>.</span>studio</Link>
    <div className="top-actions">{title && <span className="muted" style={{fontSize:12}}>{title}</span>}{actions}{isSupabaseConfigured && <button className="btn" onClick={logout}>Đăng xuất</button>}</div>
  </header>;
}
