 "use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Text, Rect, Image as KonvaImage, Transformer, Line } from "react-konva";
import useImage from "use-image";
import type Konva from "konva";
import type { DesignDoc, DesignElement } from "@/lib/types";

function ImageNode({ el, selected, onSelect, onChange }: any) {
  const [image] = useImage(el.src || "", "anonymous");
  return <KonvaImage image={image} x={el.x} y={el.y} width={el.width} height={el.height} opacity={el.opacity ?? 1}
    draggable onClick={onSelect} onTap={onSelect}
    onDragEnd={(e:any)=>onChange({...el,x:e.target.x(),y:e.target.y()})}
    onTransformEnd={(e:any)=>{const n=e.target;onChange({...el,x:n.x(),y:n.y(),width:Math.max(20,n.width()*n.scaleX()),height:Math.max(20,n.height()*n.scaleY())});n.scaleX(1);n.scaleY(1);}} />;
}

export default function CanvasEditor({ design, setDesign, selectedId, setSelectedId, preview }: {
  design: DesignDoc; setDesign: (d: DesignDoc)=>void; selectedId: string|null; setSelectedId: (id:string|null)=>void; preview: boolean;
}) {
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const nodes = useRef<Record<string, any>>({});
  const [scale, setScale] = useState(0.52);
  const selected = design.elements.find(e=>e.id===selectedId);
  useEffect(() => {
    const node = selectedId ? nodes.current[selectedId] : null;
    if (trRef.current) { trRef.current.nodes(node ? [node] : []); trRef.current.getLayer()?.batchDraw(); }
  }, [selectedId, design.elements]);
  const update = useCallback((el: DesignElement) => setDesign({...design,elements:design.elements.map(item=>item.id===el.id?el:item)}),[design,setDesign]);
  const select = (id:string) => setSelectedId(id);
  const common = (el:DesignElement) => ({
    x:el.x,y:el.y,width:el.width,height:el.height,draggable:!preview,
    opacity:el.opacity ?? 1,
    onClick:()=>select(el.id),onTap:()=>select(el.id),
    onDragEnd:(e:any)=>update({...el,x:e.target.x(),y:e.target.y()}),
    onTransformEnd:(e:any)=>{const n=e.target;update({...el,x:n.x(),y:n.y(),width:Math.max(20,n.width()*n.scaleX()),height:Math.max(20,n.height()*n.scaleY()),fontSize:el.type==="text"?Math.max(10,(el.fontSize||24)*n.scaleY()):el.fontSize});n.scaleX(1);n.scaleY(1);}
  });
  const imageFile = (src:string) => src;
  return <div className={preview ? "anim-preview" : ""}>
    <div className="canvas-frame" style={{width:design.width*scale,height:design.height*scale}}>
      <Stage width={design.width*scale} height={design.height*scale} scaleX={scale} scaleY={scale} ref={stageRef}
        onMouseDown={(e:any)=>{if(e.target===e.target.getStage())setSelectedId(null);}}>
        <Layer>
          <Rect x={0} y={0} width={design.width} height={design.height} fill={design.background} listening={false}/>
          {design.elements.map(el=>{
            const props:any = common(el);
            if(el.type==="text") return <Text key={el.id} ref={(n:any)=>{nodes.current[el.id]=n;}} {...props} text={el.text||"Văn bản"} fill={el.fill||"#333"} fontSize={el.fontSize||24} fontFamily={el.fontFamily||"Georgia"} fontStyle={el.fontStyle||"normal"} align={el.align||"left"} verticalAlign="middle" wrap="word" padding={2} />;
            if(el.type==="shape") return <Rect key={el.id} ref={(n:any)=>{nodes.current[el.id]=n;}} {...props} fill={el.fill||"#b59a72"} cornerRadius={el.radius||0}/>;
            if(el.type==="image") return <ImageNode key={el.id} el={el} selected={selectedId===el.id} onSelect={()=>select(el.id)} onChange={update}/>;
            return null;
          })}
          {!preview && <Transformer ref={trRef} rotateEnabled keepRatio={false} anchorSize={8} borderStroke="#813943" anchorStroke="#813943" anchorFill="#fff" />}
        </Layer>
      </Stage>
    </div>
  </div>;
}
