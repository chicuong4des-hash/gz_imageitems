 "use client";
import { useEffect, useState } from "react";
import { getPublicProject } from "@/lib/projects";
import type { Project, DesignElement } from "@/lib/types";

export default function PublicInvitation({slug}:{slug:string}) {
  const [project,setProject]=useState<Project|null>(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{getPublicProject(slug).then(setProject).catch(()=>setProject(null)).finally(()=>setLoading(false));},[slug]);
  if(loading)return <main className="public-page">Đang mở thiệp…</main>;
  if(!project)return <main className="public-page"><div className="public-card" style={{textAlign:"center",padding:50}}>Thiệp này chưa được xuất bản hoặc đường dẫn không tồn tại.</div></main>;
  const d=project.design;
  function renderElement(el: DesignElement) {
    const style: React.CSSProperties = {
      position:"absolute", left:`${el.x/d.width*100}%`, top:`${el.y/d.height*100}%`,
      width:`${el.width/d.width*100}%`, height:`${el.height/d.height*100}%`,
      opacity:el.opacity??1, color:el.fill||"#333", fontFamily:el.fontFamily||"Georgia",
      fontSize:`${(el.fontSize||24)/d.width*100}cqw`, fontStyle:el.fontStyle||"normal",
      textAlign:(el.align||"left") as any, whiteSpace:"pre-wrap", overflowWrap:"anywhere",
      display:el.type==="text"?"flex":"block", alignItems:"center", justifyContent:el.align==="center"?"center":"flex-start",
      lineHeight:1.2, animation:el.animation==="fade"?"inviteFade 1.2s both":el.animation==="float"?"inviteFloat 3s ease-in-out infinite":el.animation==="zoom"?"inviteZoom 1.7s ease-in-out infinite alternate":undefined,
      transformOrigin:"center center"
    };
    if(el.type==="text") return <div key={el.id} style={style}>{el.text}</div>;
    if(el.type==="shape") return <div key={el.id} style={{...style,background:el.fill||"#b59a72",borderRadius:el.radius||0}}/>;
    if(el.type==="image" && el.src) return <img key={el.id} src={el.src} alt="" style={{...style,objectFit:"contain"}}/>;
    return null;
  }
  return <main className="public-page">
    <style>{`@keyframes inviteFade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes inviteFloat{0%,100%{translate:0 0}50%{translate:0 -7px}}@keyframes inviteZoom{from{scale:.98}to{scale:1.03}}`}</style>
    <div style={{width:"min(100%,720px)"}}>
      <div className="public-caption">YOU ARE INVITED · {project.title.toUpperCase()}</div>
      <div className="public-card" style={{padding:0}}>
        <div style={{position:"relative",width:"100%",aspectRatio:`${d.width}/${d.height}`,containerType:"inline-size",overflow:"hidden",background:d.background}}>
          {d.elements.map(renderElement)}
        </div>
      </div>
      <p style={{textAlign:"center",fontSize:11,color:"#8b7c70",marginTop:18}}>Trân trọng cảm ơn bạn đã dành thời gian chung vui cùng gia đình.</p>
    </div>
  </main>;
}
