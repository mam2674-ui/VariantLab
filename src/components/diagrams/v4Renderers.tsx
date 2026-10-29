"use client";

import { Part, DnaPath, RnaPath, polar, type Renderer, type RendererProps } from "./kit";

const loop = "M 250 200 C 275 125 130 120 145 200 S 225 280 250 200 Z";
const hex = (cy: number, r: number) => [0,60,120,180,240,300].map(a => polar(200,cy,r,a).join(",")).join(" ");
function Genome({ p, double = false }: { p: RendererProps; double?: boolean }) {
  return p.view === "cutaway" && <Part id="genome" p={p}>{double ? <DnaPath d={loop}/> : <RnaPath d={loop}/>}</Part>;
}
export const fusellovirusRenderer: Renderer = {
  viewBox: "0 0 400 400", parts: ["shell","fibres","genome"], interior: ["genome"],
  markers: { shell: [146,175], fibres: [310,203], genome: [205,205] },
  Draw: p => <>
    <Part id="shell" p={p}><path d="M 90 200 Q 200 60 310 200 Q 200 340 90 200 Z" className="stroke-capsid" fill={p.view === "cutaway" ? "none" : "var(--c-capsid-soft)"} strokeWidth={6}/></Part>
    <Part id="fibres" p={p}>{[-1,0,1].map(i => <path key={i} d={`M 310 200 Q 330 ${200+i*12} 345 ${200+i*24}`} className="stroke-fibre" fill="none" strokeWidth={4}/>)}</Part>
    <Genome p={p} double/>
  </>,
};
export const mimivirusRenderer: Renderer = {
  viewBox: "0 0 400 400", parts: ["fibres","capsid","stargate","core","genome"], interior: ["core","genome"],
  markers: { fibres:[325,200], capsid:[255,275], stargate:[200,100], core:[145,180], genome:[205,220] },
  Draw: p => <>
    <Part id="fibres" p={p}>{Array.from({length:80},(_,i)=>{const a=polar(200,200,107,i*4.5), b=polar(200,200,143,i*4.5);return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className="stroke-fibre" strokeWidth={3}/>;})}</Part>
    <Part id="capsid" p={p}><polygon points={hex(200,110)} className="stroke-capsid" fill={p.view === "cutaway" ? "none" : "var(--c-capsid-soft)"} strokeWidth={7}/></Part>
    <Part id="stargate" p={p}><path d="M 180 100 L 200 110 L 220 100 M 200 110 L 200 135 M 200 110 L 178 120 M 200 110 L 222 120" className="stroke-portal" strokeWidth={5}/></Part>
    {p.view === "cutaway" && <Part id="core" p={p}><circle cx={200} cy={200} r={77} fill="none" className="stroke-nucleocapsid" strokeWidth={7}/><circle cx={200} cy={200} r={85} fill="none" className="stroke-envelope" strokeWidth={3}/><circle cx={200} cy={200} r={91} fill="none" className="stroke-envelope" strokeWidth={3}/></Part>}
    <Genome p={p} double/>
  </>,
};
export const geminivirusRenderer: Renderer = {
  viewBox:"0 0 400 400", parts:["coat","genome"], interior:["genome"], markers:{coat:[245,125],genome:[200,200]},
  Draw:p=><><Part id="coat" p={p}><path d="M 200 65 L 275 110 L 275 165 L 250 200 L 275 235 L 275 290 L 200 335 L 125 290 L 125 235 L 150 200 L 125 165 L 125 110 Z" className="stroke-capsid" strokeWidth={6} fill={p.view === "cutaway" ? "none" : "var(--c-capsid-soft)"}/><path d="M 150 200 L 250 200" className="stroke-capsid" strokeWidth={3}/></Part><Genome p={p}/></>,
};
export const inovirusRenderer: Renderer = {
  viewBox:"0 0 400 400", parts:["coat","p3","genome"], interior:["genome"], markers:{coat:[175,190],p3:[200,55],genome:[215,240]},
  Draw:p=><><Part id="coat" p={p}><rect x={170} y={85} width={60} height={250} rx={25} fill={p.view === "cutaway" ? "none" : "var(--c-capsid-soft)"} className="stroke-capsid" strokeWidth={5}/>{Array.from({length:24},(_,i)=><path key={i} d={`M 174 ${98+i*9} l 52 12`} className="stroke-capsid" strokeWidth={3}/>)}</Part><Part id="p3" p={p}>{[-1,0,1].map(i=><path key={i} d={`M ${200+i*15} 88 Q ${200+i*25} 68 ${200+i*23} 50`} className="stroke-surface" fill="none" strokeWidth={6}/>)}</Part>{p.view === "cutaway" && <Part id="genome" p={p}><RnaPath d="M 193 105 L 193 310 Q 200 325 207 310 L 207 105 Q 200 92 193 105 Z"/></Part>}</>,
};
export const deltavirusRenderer: Renderer = {
  viewBox:"0 0 400 400",parts:["envelope","dag","genome"],interior:["dag","genome"],markers:{envelope:[285,140],dag:[245,190],genome:[200,225]},
  Draw:p=><><Part id="envelope" p={p}><circle cx={200} cy={200} r={115} className="stroke-envelope" strokeWidth={9} fill={p.view === "cutaway" ? "none" : "var(--c-envelope-soft)"}/>{Array.from({length:24},(_,i)=>{const a=polar(200,200,116,i*15), b=polar(200,200,128,i*15);return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className="stroke-surface" strokeWidth={5}/>;})}</Part>{p.view === "cutaway" && <><Part id="dag" p={p}>{Array.from({length:10},(_,i)=><ellipse key={i} cx={i%2 ? 218:182} cy={145+Math.floor(i/2)*27} rx={10} ry={13} className="fill-nucleocapsid"/>)}</Part><Part id="genome" p={p}><RnaPath d="M 195 130 L 195 270 Q 200 280 205 270 L 205 130 Q 200 120 195 130 Z"/></Part></>}</>,
};
export const totivirusRenderer: Renderer = {
  viewBox:"0 0 400 400", parts:["capsid","genome"], interior:["genome"], markers:{capsid:[280,180],genome:[200,200]},
  Draw:p=><><Part id="capsid" p={p}><polygon points={hex(200,125)} className="stroke-capsid" strokeWidth={7} fill={p.view === "cutaway" ? "none" : "var(--c-capsid-soft)"}/>{p.view === "exterior" && [0,60,120,180,240,300].map(a=>{const [x,y]=polar(200,200,125,a);return <line key={a} x1={200} y1={200} x2={x} y2={y} className="stroke-capsid" strokeWidth={2}/>;})}</Part><Genome p={p} double/></>,
};
