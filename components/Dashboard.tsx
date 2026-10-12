 "use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGate from "./AuthGate";
import StudioHeader from "./StudioHeader";
import { createProject, deleteProject, listProjects } from "@/lib/projects";
import type { Project } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase";

function DashboardInner() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("Thiệp cưới mới");
  async function refresh() {
    setLoading(true); setError("");
    try { setProjects(await listProjects()); } catch (e:any) { setError(e.message || "Không tải được dự án."); }
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);
  async function create() {
    setCreating(true);
    try { const p = await createProject(title.trim() || "Thiệp cưới mới"); location.href = `/editor/${p.id}`; }
    catch(e:any) { setError(e.message || "Không tạo được dự án."); setCreating(false); }
  }
  async function remove(p: Project) {
    if (!confirm(`Xóa dự án “${p.title}”?`)) return;
    try { await deleteProject(p.id); await refresh(); } catch(e:any) { setError(e.message || "Không xóa được dự án."); }
  }
  return <main className="app-shell">
    <StudioHeader actions={<button className="btn primary" onClick={create} disabled={creating}>＋ Tạo dự án</button>} />
    <section className="wrap">
      <div className="eyebrow">Your creative workspace</div><h1 className="heading">Dự án của bạn</h1>
      <p className="muted" style={{fontSize:14}}>Thiết kế, quản lý và xuất bản thiệp cưới trong một nơi.</p>
      {!isSupabaseConfigured && <div className="notice" style={{marginTop:20}}>Đang ở chế độ demo: dự án được lưu trong trình duyệt hiện tại. Muốn link công khai hoạt động trên mọi thiết bị, hãy cấu hình Supabase theo README.</div>}
      {error && <div className="notice" style={{marginTop:15}}>{error}</div>}
      <div className="project-grid">
        <button className="project-card" onClick={create} disabled={creating} style={{textAlign:"left",borderStyle:"dashed",cursor:"pointer"}}>
          <div className="project-thumb" style={{background:"#f8f2e9"}}><div style={{fontSize:48,color:"#9c8a75"}}>＋</div></div>
          <div className="project-meta"><div className="project-title">{creating ? "Đang tạo…" : "Tạo thiết kế mới"}</div><p className="muted" style={{fontSize:12}}>Bắt đầu từ mẫu thiệp cưới</p></div>
        </button>
        {projects.map(p => <article className="project-card" key={p.id}>
          <Link href={`/editor/${p.id}`}>
            <div className="project-thumb" style={{background:p.design.background}}>
              <div className="mini-paper" style={{background:p.design.background}}>
                <small>TRÂN TRỌNG KÍNH MỜI</small>
                <strong>{(p.design.elements.find(e=>e.type==="text" && e.text?.includes("&"))?.text || p.title).slice(0,24)}</strong>
                <small>♡ · LỄ THÀNH HÔN · ♡</small>
              </div>
            </div>
          </Link>
          <div className="project-meta">
            <div className="project-title">{p.title}</div>
            <div className="project-row"><span className={`pill ${p.is_public ? "live" : ""}`}>{p.is_public ? "Đã xuất bản" : "Bản nháp"}</span><button className="btn" style={{padding:"6px 9px"}} onClick={()=>remove(p)}>Xóa</button></div>
            <div style={{marginTop:10}}><Link className="btn" style={{width:"100%"}} href={`/editor/${p.id}`}>Mở thiết kế ↗</Link></div>
          </div>
        </article>)}
      </div>
      {loading && <p className="muted" style={{marginTop:24}}>Đang tải dự án…</p>}
      {!loading && projects.length===0 && <div className="empty"><h3>Chưa có dự án nào</h3><p className="muted">Tạo thiệp đầu tiên của bạn để bắt đầu.</p><button className="btn primary" onClick={create}>＋ Tạo dự án đầu tiên</button></div>}
    </section>
  </main>;
}
export default function Dashboard() { return <AuthGate><DashboardInner /></AuthGate>; }
