 "use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGate from "./AuthGate";
import StudioHeader from "./StudioHeader";
import CanvasEditor from "./CanvasEditor";
import { getProject, saveProject } from "@/lib/projects";
import type { Project, DesignDoc, DesignElement } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase";

function EditorInner({ id }: { id: string }) {
  const [project,setProject] = useState<Project|null>(null);
  const [design,setDesign] = useState<DesignDoc|null>(null);
  const [selectedId,setSelectedId] = useState<string|null>(null);
  const [title,setTitle] = useState("");
  const [saving,setSaving] = useState(false);
  const [preview,setPreview] = useState(false);
  const [notice,setNotice] = useState("");
  const selected = design?.elements.find(e=>e.id===selectedId) || null;

  useEffect(()=>{getProject(id).then(p=>{if(p){setProject(p);setDesign(p.design);setTitle(p.title)}else setNotice("Không tìm thấy dự án. Quay về trang dự án và thử lại.")}).catch(e=>setNotice(e.message));},[id]);

  function patchElement(patch:Partial<DesignElement>) {
    if(!design || !selected) return;
    setDesign({...design,elements:design.elements.map(e=>e.id===selected.id?{...e,...patch}:e)});
  }
  function addText() {
    if(!design)return;
    const el:DesignElement={id:crypto.randomUUID(),type:"text",x:140,y:820,width:520,height:70,text:"Nhập nội dung của bạn",fill:"#813943",fontSize:32,fontFamily:"Georgia",align:"center",animation:"fade"};
    setDesign({...design,elements:[...design.elements,el]});setSelectedId(el.id);
  }
  function addShape() {
    if(!design)return;
    const el:DesignElement={id:crypto.randomUUID(),type:"shape",x:170,y:900,width:460,height:3,fill:"#b59a72",animation:"none"};
    setDesign({...design,elements:[...design.elements,el]});setSelectedId(el.id);
  }
  function addImage(file?:File) {
    if(!file || !design)return;
    if(!file.type.startsWith("image/")){setNotice("Vui lòng chọn file ảnh.");return;}
    const reader=new FileReader();
    reader.onload=()=>{const el:DesignElement={id:crypto.randomUUID(),type:"image",x:200,y:200,width:400,height:280,src:String(reader.result),animation:"fade"};setDesign({...design,elements:[...design.elements,el]});setSelectedId(el.id);};
    reader.readAsDataURL(file);
  }
  async function save(publish?:boolean) {
    if(!project||!design)return;
    setSaving(true);setNotice("");
    const next={...project,title:title.trim()||"Thiệp cưới",design,is_public:publish===undefined?project.is_public:publish};
    try {
      const saved=await saveProject(next);setProject(saved);setNotice(publish===true?"Đã xuất bản thiệp!":publish===false?"Đã chuyển thiệp về bản nháp.":"Đã lưu thiết kế.");
      if(publish===true) { await navigator.clipboard?.writeText(`${location.origin}/i/${saved.slug}`); }
    } catch(e:any){setNotice(`Lỗi lưu: ${e.message||"không xác định"}`);}
    setSaving(false);
  }
  function removeSelected() { if(!design||!selected)return;setDesign({...design,elements:design.elements.filter(e=>e.id!==selected.id)});setSelectedId(null); }
  function duplicateSelected() { if(!design||!selected)return;const copy={...selected,id:crypto.randomUUID(),x:selected.x+24,y:selected.y+24};setDesign({...design,elements:[...design.elements,copy]});setSelectedId(copy.id); }
  function exportPng() {
    const canvas=document.querySelector(".canvas-frame canvas") as HTMLCanvasElement|null;
    if(!canvas){setNotice("Không tìm thấy canvas để xuất ảnh.");return;}
    const a=document.createElement("a");a.download=`${title||"thiep-cuoi"}.png`;a.href=canvas.toDataURL("image/png");a.click();
  }
  if(!design||!project) return <main className="app-shell"><StudioHeader/><div className="wrap">{notice||"Đang mở dự án…"}</div></main>;
  return <main className="app-shell">
    <StudioHeader title={isSupabaseConfigured?"Đã kết nối cloud":"Chế độ demo local"} actions={<>
      <Link className="btn" href="/dashboard">← Dự án</Link>
      <button className="btn" onClick={()=>setPreview(!preview)}>{preview?"✎ Chỉnh sửa":"▷ Xem trước"}</button>
      <button className="btn" onClick={exportPng}>↓ PNG</button>
      <button className="btn" onClick={()=>save()} disabled={saving}>{saving?"Đang lưu…":"Lưu"}</button>
      <button className="btn primary" onClick={()=>save(true)} disabled={saving}>↗ Xuất bản</button>
    </>}/>
    <div className="editor-shell">
      <aside className="side">
        <h3>Thêm nội dung</h3>
        <div className="tool-grid">
          <button className="tool" onClick={addText}><span className="tool-icon">T</span>Văn bản</button>
          <label className="tool" style={{cursor:"pointer"}}><span className="tool-icon">▧</span>Thêm ảnh<input type="file" accept="image/*" hidden onChange={e=>{addImage(e.target.files?.[0]);e.currentTarget.value="";}}/></label>
          <button className="tool" onClick={addShape}><span className="tool-icon">━</span>Đường nét</button>
          <button className="tool" onClick={()=>setDesign({...design,background:design.background==="#fbf5ec"?"#f7e9e9":"#fbf5ec"})}><span className="tool-icon">◐</span>Nền nhanh</button>
        </div>
        <div className="divider"/>
        <h3>Trang thiết kế</h3>
        <div className="field"><label>Tên dự án</label><input value={title} onChange={e=>setTitle(e.target.value)} onBlur={()=>{if(project)setProject({...project,title});}}/></div>
        <div className="field"><label>Màu nền</label><input type="color" value={design.background} onChange={e=>setDesign({...design,background:e.target.value})}/></div>
        <div className="field"><label>Tỉ lệ canvas</label><select value={`${design.width}x${design.height}`} onChange={e=>{const [width,height]=e.target.value.split("x").map(Number);setDesign({...design,width,height});}}><option value="800x1100">Thiệp dọc · 800 × 1100</option><option value="1100x800">Thiệp ngang · 1100 × 800</option><option value="1080x1080">Vuông · 1080 × 1080</option></select></div>
        <div className="divider"/>
        <h3>Các lớp thiết kế</h3>
        <div className="layers">{[...design.elements].reverse().map(el=><button key={el.id} className={`layer ${selectedId===el.id?"selected":""}`} onClick={()=>setSelectedId(el.id)}><span>{el.type==="text"?"T":el.type==="image"?"▧":"━"} {el.text?.slice(0,22)||el.type}</span><span>↗</span></button>)}</div>
        <p className="editor-note">Chọn một lớp để chỉnh sửa. Kéo trực tiếp đối tượng trên canvas để thay đổi vị trí.</p>
      </aside>
      <section className="canvas-area">
        <div className="canvas-toolbar">
          <button className="btn" onClick={()=>setSelectedId(null)}>Bỏ chọn</button>
          <span className="muted" style={{fontSize:11}}>{design.width} × {design.height}px</span>
          {preview && <span className="pill live">Xem trước hiệu ứng</span>}
        </div>
        <div className="canvas-stage">
          <CanvasEditor design={design} setDesign={setDesign} selectedId={selectedId} setSelectedId={setSelectedId} preview={preview}/>
        </div>
      </section>
      <aside className="side right">
        <h3>{selected ? "Chỉnh sửa đối tượng" : "Thuộc tính"}</h3>
        {!selected ? <div className="notice">Chọn chữ, ảnh hoặc đường nét trên canvas để chỉnh sửa thuộc tính.</div> : <>
          {selected.type==="text" && <div className="field"><label>Nội dung</label><textarea rows={4} value={selected.text||""} onChange={e=>patchElement({text:e.target.value})}/></div>}
          {selected.type==="text" && <div className="field"><label>Font chữ</label><select value={selected.fontFamily||"Georgia"} onChange={e=>patchElement({fontFamily:e.target.value})}><option>Georgia</option><option>Arial</option><option>Times New Roman</option><option>Verdana</option><option>Courier New</option></select></div>}
          {selected.type==="text" && <div className="field"><label>Cỡ chữ · {selected.fontSize||24}px</label><input type="range" min="10" max="100" value={selected.fontSize||24} onChange={e=>patchElement({fontSize:Number(e.target.value)})}/></div>}
          <div className="field"><label>Màu</label><input type="color" value={selected.fill||"#813943"} onChange={e=>patchElement({fill:e.target.value})}/></div>
          <div className="field"><label>Độ mờ · {Math.round((selected.opacity??1)*100)}%</label><input type="range" min="10" max="100" value={Math.round((selected.opacity??1)*100)} onChange={e=>patchElement({opacity:Number(e.target.value)/100})}/></div>
          <div className="field"><label>Hiệu ứng xuất hiện</label><select value={selected.animation||"none"} onChange={e=>patchElement({animation:e.target.value as any})}><option value="none">Không có</option><option value="fade">Fade in · Mờ dần</option><option value="float">Float · Bay nhẹ</option><option value="zoom">Zoom · Phóng nhẹ</option></select></div>
          <div className="field"><label>Vị trí X</label><input type="number" value={Math.round(selected.x)} onChange={e=>patchElement({x:Number(e.target.value)})}/></div>
          <div className="field"><label>Vị trí Y</label><input type="number" value={Math.round(selected.y)} onChange={e=>patchElement({y:Number(e.target.value)})}/></div>
          <div className="field"><label>Chiều rộng</label><input type="number" min="20" value={Math.round(selected.width)} onChange={e=>patchElement({width:Number(e.target.value)})}/></div>
          <div className="field"><label>Chiều cao</label><input type="number" min="10" value={Math.round(selected.height)} onChange={e=>patchElement({height:Number(e.target.value)})}/></div>
          <div className="divider"/>
          <button className="btn" style={{width:"100%",marginBottom:8}} onClick={duplicateSelected}>▢ Nhân đôi đối tượng</button>
          <button className="btn danger" style={{width:"100%"}} onClick={removeSelected}>Xóa đối tượng</button>
        </>}
        <div className="divider"/>
        <p className="editor-note">Animation được lưu trong thiết kế. Bản xem trước hiển thị hiệu ứng CSS cơ bản; bản xuất bản hiện dùng canvas tĩnh và sẽ được mở rộng thành trình phát animation ở giai đoạn tiếp theo.</p>
      </aside>
    </div>
    {notice && <button className="toast" onClick={()=>setNotice("")}>{notice}　×</button>}
  </main>;
}
export default function Editor({id}:{id:string}) { return <AuthGate><EditorInner id={id}/></AuthGate>; }
