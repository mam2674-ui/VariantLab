"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { Source, Virus } from "@/lib/schema";
import { GENOME_CLASSES, genomeClass, type GenomeClass } from "@/lib/filter";
import { initialTraits, matchTraits, observedClasses } from "@/lib/traits";
import { SourceRefs } from "./Evidence";

const control = "w-full mt-2 bg-sunk text-ink border border-hairline-strong p-3 min-h-11 rounded-sm";
const action = "border border-hairline-strong px-4 py-2 min-h-11 text-ink hover:bg-sunk rounded-sm";
export function TraitExplorer({ viruses, sources }: { viruses: Virus[]; sources: Source[] }) {
  const [traits,setTraits] = useState(initialTraits);
  const matches = matchTraits(viruses,traits);
  const classes = observedClasses(viruses,traits.genome);
  const hosts = [...new Set(viruses.map(v=>v.hostCategory.value).filter((x): x is NonNullable<typeof x>=>Boolean(x)))];
  const classSources = [...new Set(viruses.filter(v=>!traits.genome || genomeClass(v)===traits.genome).flatMap(v=>v.baltimore.sourceIds))];
  return <div className="mt-10 space-y-14">
    <section aria-labelledby="traits-title">
      <div className="flex flex-wrap justify-between items-center gap-4"><h2 id="traits-title" className="text-ink text-2xl">Documented traits</h2><button className={action} onClick={()=>setTraits(initialTraits)}>Reset filters</button></div>
      <div className="grid gap-5 sm:grid-cols-3 mt-5">
        <label>Genome type<select aria-label="Genome type" className={control} value={traits.genome} onChange={e=>setTraits({...traits,genome:e.target.value as GenomeClass|""})}><option value="">Any genome</option>{GENOME_CLASSES.map(g=><option key={g}>{g}</option>)}</select></label>
        <label>Envelope<select aria-label="Envelope" className={control} value={traits.envelope} onChange={e=>setTraits({...traits,envelope:e.target.value as ""|"yes"|"no"})}><option value="">Either</option><option value="yes">Enveloped</option><option value="no">Non-enveloped</option></select></label>
        <label>Host category<select aria-label="Host category" className={control} value={traits.host} onChange={e=>setTraits({...traits,host:e.target.value})}><option value="">Any host</option>{hosts.map(h=><option key={h} value={h}>{h.replaceAll("-"," / ")}</option>)}</select></label>
      </div>
      <div className="mt-6 p-5 bg-elevated" aria-live="polite">
        <p className="text-xl text-ink">{matches.length} documented {matches.length===1?"match":"matches"}</p>
        <p className="mt-1">{traits.genome ? `${traits.genome} corresponds to Baltimore ${classes.length===1?"class":"classes"} ${classes.join(", ")} in this atlas.` : "Choose a genome type to see its Baltimore classification in the atlas."}</p>
        {traits.genome && <div className="mt-2"><SourceRefs ids={classSources} sources={sources}/></div>}
        <p className="text-sm text-mute mt-3">A missing match means this atlas has no such record. It does not establish that a combination is impossible. Genome type, envelope and host alone do not establish a replication site or biological viability.</p>
      </div>
      <div className="mt-5 divide-y divide-hairline max-h-[36rem] overflow-y-auto" tabIndex={0} role="region" aria-label="Matching atlas records">
        {!matches.length && <p className="py-6">No atlas entries match. Try another host or reset the filters.</p>}
        {matches.map(v=><article key={v.id} className="py-4 grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div><Link href={`/virus/${v.id}`} className="text-lg">{v.commonName}</Link><p className="text-sm text-mute">{genomeClass(v)} · Baltimore {v.baltimore.value} · {v.envelope.value?"enveloped":"non-enveloped"}</p></div>
          <div><p className="text-sm">Host: {v.hostDetail.value}</p><SourceRefs ids={[...new Set([...v.hostCategory.sourceIds,...v.envelope.sourceIds])]} sources={sources}/>
          {v.id==="hdv" && <p className="mt-2 text-sm">Classification exception: {v.baltimore.note || v.replication.mRNARoute.note || "HDV is listed as class V, but its RNA biology differs from typical members of that group."} <SourceRefs ids={v.baltimore.sourceIds} sources={sources}/></p>}</div>
        </article>)}
      </div>
    </section>
    <VisualMixer/>
  </div>;
}

function VisualMixer() {
  const [name,setName]=useState("Atlas imaginary particle");
  const [shape,setShape]=useState("sphere");
  const [surface,setSurface]=useState("dots");
  const [color,setColor]=useState("#7cc8f5");
  const svg=useRef<SVGSVGElement>(null);
  function download() {
    if(!svg.current) return;
    const blob=new Blob([new XMLSerializer().serializeToString(svg.current)],{type:"image/svg+xml"});
    const url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download="fictional-particle.svg";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  return <section id="visual-mixer" className="scroll-mt-20" aria-labelledby="mixer-title">
    <h2 id="mixer-title" className="text-2xl text-ink">Fictional visual mixer</h2>
    <p className="mt-2 max-w-2xl">Mix an outline, a surface pattern and a color to imagine a hypothetical particle. These are artistic choices; the drawing does not represent a viable virus or predict its biology.</p>
    <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] mt-6">
      <div className="space-y-4">
        <label className="block">Illustration name<input className={control} value={name} maxLength={44} onChange={e=>setName(e.target.value)}/></label>
        <label className="block">Outline<select aria-label="Outline" className={control} value={shape} onChange={e=>setShape(e.target.value)}><option value="sphere">Spherical</option><option value="faceted">Faceted</option><option value="lemon">Lemon-shaped</option><option value="twinned">Twinned</option><option value="filament">Filament</option></select></label>
        <label className="block">Surface pattern<select aria-label="Surface pattern" className={control} value={surface} onChange={e=>setSurface(e.target.value)}><option value="dots">Dots</option><option value="rays">Short rays</option><option value="rings">Rings</option><option value="plain">Plain</option></select></label>
        <label className="block">Particle color<input type="color" className={`${control} !p-1`} value={color} onChange={e=>setColor(e.target.value)}/></label>
        <div className="flex flex-wrap gap-3"><button className={action} onClick={download}>Download drawing</button><button className={action} onClick={()=>{setName("Atlas imaginary particle");setShape("sphere");setSurface("dots");setColor("#7cc8f5");}}>Reset drawing</button></div>
      </div>
      <figure className="bg-elevated p-4 min-w-0">
        <svg ref={svg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 430" role="img" aria-label={`${name || "Unnamed particle"}: fictional ${shape} outline with ${surface} pattern`} className="w-full h-auto">
          <title>{name || "Unnamed particle"}</title><desc>Fictional illustration only. No biological viability, genetic design or infection properties are implied.</desc>
          <rect width="600" height="430" fill="#0e1117"/>
          <g fill={color} fillOpacity={0.12} stroke={color} strokeWidth={4}>
            {shape==="sphere" && <circle cx={300} cy={190} r={110}/>}
            {shape==="faceted" && <polygon points="300,70 404,130 404,250 300,310 196,250 196,130"/>}
            {shape==="lemon" && <path d="M 150 190 Q 300 -10 450 190 Q 300 390 150 190 Z"/>}
            {shape==="twinned" && <path d="M 300 55 L 380 105 L 380 145 L 355 190 L 380 235 L 380 275 L 300 325 L 220 275 L 220 235 L 245 190 L 220 145 L 220 105 Z"/>}
            {shape==="filament" && <path d="M 145 225 C 240 80 360 300 455 155" fill="none" strokeWidth={25}/>}
          </g>
          <g stroke={color} fill={color} strokeWidth={2}>
            {surface!=="plain" && Array.from({length:surface==="rings"?7:28},(_,i)=>{
              if(surface==="rings") return <ellipse key={i} cx={300} cy={190} rx={25+i*12} ry={18+i*10} fill="none" opacity={0.7}/>;
              const a=i*Math.PI*2/28,x=300+Math.cos(a)*128,y=190+Math.sin(a)*128;
              return surface==="dots"?<circle key={i} cx={x} cy={y} r={4}/>:<line key={i} x1={x} y1={y} x2={300+Math.cos(a)*145} y2={190+Math.sin(a)*145}/>;
            })}
          </g>
          <text x={300} y={375} textAnchor="middle" fill="#f2f4f8" fontFamily="sans-serif" fontSize={18}>{name || "Unnamed particle"}</text>
          <text x={300} y={405} textAnchor="middle" fill="#b7bdc8" fontFamily="sans-serif" fontSize={14}>Fictional illustration · biology not predicted</text>
        </svg>
        <figcaption className="text-sm text-mute mt-2">Artistic composite. Patterns and proportions are illustrative and have no molecular meaning.</figcaption>
      </figure>
    </div>
  </section>;
}
