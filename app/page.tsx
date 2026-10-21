"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, AudioLines, Box, Check, ChevronLeft, ChevronRight, Crosshair, Expand, Layers3, Minus, MousePointer2, Plus, Radar, RotateCcw, ScanLine, VolumeX, X } from "lucide-react";
import GadgetScene, { type ModelKind } from "./components/GadgetScene";
import TrackerSimulator from "./components/TrackerSimulator";

type HeroId = "tobey" | "andrew" | "tom";
type Gadget = { id: string; name: string; thai: string; type: ModelKind; category: string; description: string; feature: string; material: string };
const heroes: {id:HeroId; actor:string; title:string; year:string; tag:string; color:string; number:string}[] = [
  { id:"tobey", actor:"โทบีย์ แมไกวร์", title:"ฮีโร่คนแรก", year:"2002 — 2007", tag:"ไตรภาคแซม ไรมี", color:"#d7323d", number:"01" },
  { id:"andrew", actor:"แอนดรูว์ การ์ฟิลด์", title:"ฮีโร่ผู้น่าทึ่ง", year:"2012 — 2014", tag:"ดิ อะเมซิง สไปเดอร์แมน", color:"#ed6848", number:"02" },
  { id:"tom", actor:"ทอม ฮอลแลนด์", title:"ฮีโร่รุ่นใหม่", year:"2016 — ปัจจุบัน", tag:"จักรวาลภาพยนตร์มาร์เวล", color:"#fa3b46", number:"03" },
];
const archive: Record<HeroId, Gadget[]> = {
  tom: [
    {id:"ติดตาม-01", name:"เครื่องติดตามแมงมุม", thai:"เครื่องติดตามแมงมุม", type:"tracker", category:"อุปกรณ์ลาดตระเวน", description:"ตัวเล็ก แต่ไม่เคยคลาดสายตา อุปกรณ์ติดตามในธีม โฮมคัมมิง ที่เปลี่ยนแมงมุมตัวจิ๋วให้เป็นผู้ช่วยตามหาเป้าหมาย สำรวจการออกแบบและทดลองส่งสัญญาณในพื้นที่จำลอง", feature:"ติดตามสัญญาณ", material:"เกราะและวงจรจำลอง"},
    {id:"ใย-02", name:"เครื่องยิงใย", thai:"เครื่องยิงใยสตาร์ก", type:"shooter", category:"เทคโนโลยีใยแมงมุม", description:"เมื่อไอเดียของ ปีเตอร์ พบกับเทคโนโลยีของ โทนี สตาร์ก เครื่องยิงใยจึงพัฒนาไปอีกขั้นด้วยรูปแบบการยิงที่หลากหลาย โมเดลนี้ตีความกลไกขึ้นใหม่สำหรับการจัดแสดง", feature:"รูปแบบใยหลากหลาย", material:"กลไกข้อมือจำลอง"},
    {id:"โดรน-03", name:"โดรนแมงมุม", thai:"โดรนสำรวจแมงมุม", type:"drone", category:"อุปกรณ์สำรวจทางอากาศ", description:"ผู้ช่วยสำรวจที่แยกตัวออกจากตราแมงมุมบนอกชุดใน โฮมคัมมิง เปิดมุมมองใหม่ให้ ปีเตอร์ ด้วยอุปกรณ์ขนาดเล็กที่พร้อมออกบิน", feature:"สำรวจทางอากาศ", material:"โครงโดรนจำลอง"},
  ],
  andrew: [
    {id:"ใย-01", name:"เครื่องยิงใย", thai:"เครื่องยิงใยอเมซิง", type:"shooter", category:"สิ่งประดิษฐ์ของปาร์กเกอร์", description:"เริ่มต้นจากโต๊ะทำงานของ ปีเตอร์ สู่เครื่องยิงใยที่เขาออกแบบและประกอบขึ้นเอง ความคิดแบบนักประดิษฐ์ที่ทำให้ สไปเดอร์แมน โหนผ่านตึกสูงได้อย่างคล่องตัว", feature:"สิ่งประดิษฐ์ของ ปีเตอร์", material:"กลไกข้อมือจำลอง"},
    {id:"ตลับ-02", name:"ตลับใยแมงมุม", thai:"ตลับใยแมงมุม", type:"cartridge", category:"เทคโนโลยีใยแมงมุม", description:"สำรวจชิ้นส่วนที่ได้แรงบันดาลใจจากระบบใยของ ดิ อะเมซิง สไปเดอร์แมน งานออกแบบสำหรับเว็บนี้เปิดให้ดูตลับและรายละเอียดภายในอย่างใกล้ชิด", feature:"แยกดูส่วนประกอบ", material:"ตลับใยจำลอง"},
    {id:"หน้ากาก-03", name:"หน้ากากอเมซิง", thai:"หน้ากากอเมซิง", type:"mask", category:"การออกแบบชุด", description:"หน้ากากตาข่ายสีแดงและเลนส์โทนทองที่ได้แรงบันดาลใจจาก ดิ อะเมซิง สไปเดอร์แมน ปี 2012 รูปทรงเพรียวและดุดันในแบบของ แอนดรูว์ การ์ฟิลด์", feature:"เลนส์โทนทอง", material:"ผิวตาข่ายจำลอง"},
  ],
  tobey: [
    {id:"หน้ากาก-01", name:"หน้ากากคลาสสิก", thai:"หน้ากากคลาสสิก", type:"mask", category:"การออกแบบชุด", description:"สีแดง ลายใย และดวงตาที่เป็นภาพจำ หน้ากากที่ได้แรงบันดาลใจจาก สไปเดอร์แมน ของ แซม ไรมี จุดเริ่มต้นของฮีโร่ข้างบ้านบนจอภาพยนตร์", feature:"ลายใยนูนคลาสสิก", material:"ผิวชุดจำลอง"},
    {id:"ชีวภาพ-02", name:"ใยชีวภาพ", thai:"ใยชีวภาพ", type:"web", category:"พลังทางชีวภาพ", description:"สไปเดอร์แมน เวอร์ชัน โทบีย์ ปล่อยใยจากข้อมือด้วยพลังทางชีวภาพ จึงไม่มีเครื่องยิงใยแบบกลไก ชิ้นจัดแสดงนี้จำลองเส้นใยและจัดอยู่ในหมวดพลังพิเศษ", feature:"พลังพิเศษทางชีวภาพ", material:"โครงข่ายเส้นใยจำลอง"},
    {id:"กล้อง-03", name:"กล้องของปีเตอร์", thai:"กล้องของปีเตอร์", type:"camera", category:"อุปกรณ์คู่ใจ", description:"ก่อนจะเป็นภาพหน้าหนึ่งของ เดลีบิวเกิล ก็ต้องผ่านเลนส์ของ ปีเตอร์ ปาร์กเกอร์ อุปกรณ์คู่ใจของช่างภาพหนุ่มที่มีมุมถ่าย สไปเดอร์แมน ไม่เหมือนใคร", feature:"อุปกรณ์ช่างภาพ", material:"กล้องตีความใหม่"},
  ],
};

function SpiderMark({className=""}:{className?:string}) {
  return <span className={`spider-mark ${className}`} aria-hidden="true"><i/><b/>{Array.from({length:8},(_,i)=><span key={i} style={{"--leg":i} as React.CSSProperties}/>)}</span>;
}

function Intro({ready,onDone}:{ready:boolean;onDone:()=>void}) {
  const [progress,setProgress]=useState(0);
  const [leaving,setLeaving]=useState(false);
  const startedAt=useRef<number|null>(null);
  useEffect(()=>{
    startedAt.current??=Date.now();
    const start=startedAt.current;
    const timer=window.setInterval(()=>{
      const elapsed=Date.now()-start;
      const next=Math.min(ready?100:92,Math.round(elapsed/19));
      setProgress(previous=>Math.max(previous,next));
      if ((ready&&elapsed>1900)||elapsed>6000) {
        setProgress(100);
        setLeaving(true);
        clearInterval(timer);
      }
    },50);
    return ()=>clearInterval(timer);
  },[ready]);
  useEffect(()=>{if(!leaving)return; const timer=setTimeout(onDone,650);return ()=>clearTimeout(timer);},[leaving,onDone]);
  return <div className={`intro ${leaving?"intro-leaving":""}`} aria-label="กำลังเข้าสู่ ห้องแล็บแมงมุม" role="status"><div className="intro-web"/><div className="intro-core"><SpiderMark/><p>ห้องแล็บ<span>แมงมุม</span></p><div className="intro-meter"><span style={{width:`${progress}%`}}/></div><div className="intro-status"><span>{progress<40?"กำลังเตรียมระบบ":progress<85?"เชื่อมต่อจักรวาลแมงมุม":"ยินดีต้อนรับสู่ห้องแล็บ"}</span><span>{String(progress).padStart(3,"0")}%</span></div></div><span className="intro-bottom">พลังอันยิ่งใหญ่ มาพร้อมไอเดียที่ยิ่งกว่า</span></div>;
}

export default function Home() {
  const [heroId,setHeroId]=useState<HeroId>("tom");
  const [index,setIndex]=useState(0);
  const [ready,setReady]=useState(false);
  const [intro,setIntro]=useState(true);
  const [exploded,setExploded]=useState(false);
  const [autoRotate,setAutoRotate]=useState(true);
  const [zoom,setZoom]=useState(1);
  const [resetKey,setResetKey]=useState(0);
  const [tracker,setTracker]=useState(false);
  const [sound,setSound]=useState(false);
  const [cinema,setCinema]=useState(false);
  const [about,setAbout]=useState(false);
  const audioRef=useRef<AudioContext|null>(null);
  const aboutRef=useRef<HTMLDialogElement>(null);
  const hero=heroes.find(h=>h.id===heroId)!;
  const gadgets=archive[heroId];
  const item=gadgets[index];
  const onReady=useCallback(()=>setReady(true),[]);
  const onIntroDone=useCallback(()=>setIntro(false),[]);
  const beep=useCallback(()=>{const ctx=audioRef.current;if(!sound||!ctx)return;void ctx.resume(); const oscillator=ctx.createOscillator();const gain=ctx.createGain();oscillator.connect(gain);gain.connect(ctx.destination);oscillator.frequency.setValueAtTime(520,ctx.currentTime);oscillator.frequency.exponentialRampToValueAtTime(190,ctx.currentTime+.11);gain.gain.setValueAtTime(.025,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.15);oscillator.start();oscillator.stop(ctx.currentTime+.15);},[sound]);
  const select=(id:HeroId,i=0)=>{setHeroId(id);setIndex(i);setExploded(false);setZoom(1);setResetKey(k=>k+1);beep();};
  const openTracker=()=>{beep();setTracker(true);};
  const reset=()=>{setZoom(1);setExploded(false);setResetKey(k=>k+1);beep();};
  useEffect(()=>()=>{void audioRef.current?.close();},[]);
  useEffect(()=>{if(about)aboutRef.current?.showModal();else aboutRef.current?.close();},[about]);
  useEffect(()=>{if(!cinema)return; const key=(e:KeyboardEvent)=>{if(e.key==="Escape")setCinema(false);};const prev=document.body.style.overflow;document.body.style.overflow="hidden";window.addEventListener("keydown",key);return()=>{document.body.style.overflow=prev;window.removeEventListener("keydown",key);};},[cinema]);
  const toggleSound=()=>{if(!sound){try{audioRef.current??=new AudioContext();void audioRef.current.resume();setSound(true);}catch{setSound(false);}}else setSound(false);};

  return <>
    {intro&&<Intro ready={ready} onDone={onIntroDone}/>}
    <a href="#lab" className="skip-link">ข้ามไปยังโมเดล สามมิติ</a>
    <header className="site-header"><a href="#lab" className="brand" aria-label="ห้องแล็บแมงมุม หน้าหลัก"><SpiderMark/><span>ห้องแล็บ<span className="brand-lab">แมงมุม</span><small>คลังสิ่งประดิษฐ์</small></span></a><nav aria-label="เมนูหลัก"><a className="nav-active" href="#archive">คลังอุปกรณ์<span>01</span></a><button onClick={openTracker}>เครื่องติดตาม<ArrowUpRight size={13}/></button><button onClick={()=>setAbout(true)}>เกี่ยวกับแล็บ</button></nav><div className="header-status"><span className="status-dot"/>ทุกระบบพร้อม</div><button className="icon-btn sound-btn" onClick={toggleSound} aria-label={sound?"ปิดเสียงเอฟเฟกต์":"เปิดเสียงเอฟเฟกต์"} aria-pressed={sound}>{sound?<AudioLines size={18}/>:<VolumeX size={18}/>}</button></header>

    <main>
      <section className={`hero-section ${cinema?"cinema-mode":""}`} id="lab" aria-label="ห้องแล็บโมเดลสามมิติ">
        <div className="hero-grid"/><div className="hero-watermark" aria-hidden="true">แมงมุม</div>
        <div className="lab-topline"><span><span className="tiny-cross">+</span> ห้องวิจัยของปีเตอร์ ปาร์กเกอร์</span><span>เริ่มต้นปี 2002 <span className="topline-slash">/</span> นครนิวยอร์ก</span></div>
        <div className="hero-copy"><div className="eyebrow"><span className="red-line"/>เบื้องหลังฮีโร่ คือความคิดที่ไม่ธรรมดา</div><h1>พลังยิ่งใหญ่<br/><span>ไอเดีย</span><br/>ยิ่งกว่า<span className="red-period">.</span></h1><p className="hero-intro">เบื้องหลังหน้ากาก คือความคิดที่ไม่ธรรมดา<br/>สำรวจสิ่งประดิษฐ์ อุปกรณ์ และพลังของ สไปเดอร์แมน<br className="desktop-break"/> ทั้ง 3 ยุค ผ่านประสบการณ์สามมิติ</p><a href="#archive" className="primary-btn" onClick={beep}>เข้าสู่คลังสิ่งประดิษฐ์<ArrowDown size={17}/></a><div className="hero-note"><Box size={14}/><span>3 ฮีโร่<span className="note-divider"/>9 ชิ้นจัดแสดง<span className="note-divider"/>ตำนานเดียวกัน</span></div></div>
        <div className="model-stage">
          <div className="stage-orbit orbit-one"/><div className="stage-orbit orbit-two"/>
          <div className="model-index"><span>ชิ้นจัดแสดง / {item.id}</span><div><span className="status-dot"/> สามมิติแบบโต้ตอบ</div></div>
          <div className="model-canvas"><GadgetScene kind={item.type} accent={hero.color} exploded={exploded} autoRotate={autoRotate} zoom={zoom} resetKey={resetKey} onReady={onReady}/></div>
          <div className="model-callout callout-one"><span className="callout-line"/><span>{exploded?"มุมมองแยกชิ้นส่วน":"ออกแบบให้เหนือชั้น"}<small>{exploded?"สำรวจชิ้นส่วนภายใน":"รายละเอียดที่ซ่อนอยู่เบื้องหลังพลัง"}</small></span></div>
          <div className="model-callout callout-two"><span className="callout-point"/><span>{item.feature}<small>แบบจำลอง / {item.id}</small></span></div>
          <div className="model-ground-label" aria-hidden="true">{item.id}<span>คลังอุปกรณ์ต้นแบบ</span></div>
          <div className="viewer-bottom"><div className="drag-hint"><MousePointer2 size={13}/><span>ลากเพื่อหมุน · เลื่อนหรือจีบนิ้วเพื่อซูม</span></div><button className="icon-btn cinema-btn" onClick={()=>setCinema(v=>!v)} aria-label={cinema?"ออกจากมุมมองเต็มจอ":"เปิดมุมมองเต็มจอ"} aria-pressed={cinema}>{cinema?<X size={17}/>:<Expand size={17}/>}</button></div>
        </div>
        <div className="viewer-controls" aria-label="ควบคุมโมเดล สามมิติ"><div className="control-label"><span className="red-square"/> สำรวจรายละเอียด</div><div className="control-group"><button onClick={()=>{setAutoRotate(v=>!v);beep();}} className={autoRotate?"active":""} aria-pressed={autoRotate}><RotateCcw size={15}/><span>หมุนอัตโนมัติ</span></button><button onClick={()=>{setExploded(v=>!v);beep();}} className={exploded?"active":""} aria-pressed={exploded}><Layers3 size={16}/><span>แยกชิ้นส่วน</span></button><span className="control-separator"/><button onClick={()=>setZoom(z=>Math.max(.65,Math.round((z-.2)*100)/100))} disabled={zoom<=.65} aria-label="ซูมออก"><Minus size={16}/></button><span className="zoom-value" aria-live="polite">{Math.round(zoom*100)}%</span><button onClick={()=>setZoom(z=>Math.min(2,Math.round((z+.2)*100)/100))} disabled={zoom>=2} aria-label="ซูมเข้า"><Plus size={16}/></button><button onClick={reset} aria-label="รีเซ็ตมุมมอง"><Crosshair size={16}/></button></div><span className="controls-shortcut">แสดงผลทันที</span></div>
      </section>

      <section className="archive-section" id="archive">
        <div className="section-heading"><div><div className="eyebrow"><span className="red-line"/>นักประดิษฐ์ใต้หน้ากาก</div><h2>แมงมุมสามยุค <span>ไอเดียไร้ขีดจำกัด</span></h2></div><span className="section-number">01 — 03</span></div>
        <div className="hero-selector" role="group" aria-label="เลือก สไปเดอร์แมน">
          {heroes.map(h=><button key={h.id} className={`hero-card hero-${h.id} ${heroId===h.id?"selected":""}`} onClick={()=>select(h.id)} aria-pressed={heroId===h.id}><div className="hero-card-number">{h.number}<span>{h.year}</span></div><div className="mask-art" aria-hidden="true"><div className="mask-face"><i/><b/></div></div><div className="hero-card-copy"><span>{h.title}</span><h3>{h.actor}</h3><p>{h.tag}</p></div><span className="hero-card-select">{heroId===h.id?<Check size={16}/>:<ArrowUpRight size={18}/>}</span></button>)}
        </div>

        <div className="archive-detail"><div className="gadget-list"><div className="list-heading"><span>คลังอุปกรณ์</span><span>0{gadgets.length} ชิ้น</span></div>{gadgets.map((g,i)=><button className={`gadget-row ${index===i?"selected":""}`} key={g.id} onClick={()=>select(heroId,i)} aria-pressed={index===i}><span className="gadget-num">0{i+1}</span><span className="gadget-row-info"><strong>{g.name}</strong><span>{g.thai}</span></span>{index===i?<span className="viewing-badge">กำลังดู</span>:<ArrowUpRight size={17}/>}</button>)}</div><article className="gadget-detail" aria-live="polite"><div className="gadget-detail-top"><span className="eyebrow">{item.category}</span><span className="object-chip">{item.id}</span></div><h3>{item.name}<span>{item.thai}</span></h3><p>{item.description}</p><div className="detail-specs"><div><span>คอลเลกชัน</span><strong>{hero.actor}</strong></div><div><span>ประเภทชิ้นจัดแสดง</span><strong>{item.material}</strong></div></div><div className="detail-actions"><a href="#lab" className="text-btn" onClick={()=>{setZoom(1.3);beep();}}>สำรวจโมเดล สามมิติ<ArrowUpRight size={16}/></a>{item.type==="tracker"&&<button className="text-btn tracker-link" onClick={openTracker}>ทดลองติดตาม<Radar size={16}/></button>}<div className="item-pagination"><button className="icon-btn" aria-label="อุปกรณ์ก่อนหน้า" onClick={()=>select(heroId,(index+gadgets.length-1)%gadgets.length)}><ChevronLeft size={16}/></button><span>{index+1} / {gadgets.length}</span><button className="icon-btn" aria-label="อุปกรณ์ถัดไป" onClick={()=>select(heroId,(index+1)%gadgets.length)}><ChevronRight size={16}/></button></div></div></article></div>
      </section>

      <section className="tracker-banner"><div className="banner-radar" aria-hidden="true"><i/><b/><span/><div/></div><div className="tracker-banner-copy"><div className="eyebrow"><span className="status-dot"/>เครื่องติดตามแมงมุม / ทดลองภาคสนาม</div><h2>อุปกรณ์จิ๋ว<br/><span>สัมผัสแมงมุมที่ยิ่งใหญ่</span></h2><p>สวมบทบาท ปีเตอร์ ส่งสัญญาณและค้นหาเป้าหมาย<br/>ทดลอง เครื่องติดตามแมงมุม ในพื้นที่จำลองของนิวยอร์ก</p><button className="primary-btn" onClick={openTracker}>เปิดระบบติดตาม<Radar size={18}/></button></div><div className="banner-coordinate"><ScanLine size={21}/><span>เขตนิวยอร์ก — 03<small>พื้นที่จำลอง</small></span></div></section>
      <div className="closing-line"><span>“</span>พลังอันยิ่งใหญ่ มาพร้อมความรับผิดชอบอันใหญ่ยิ่ง<span>”</span></div>
    </main>

    <footer><a href="#lab" className="footer-brand">ห้องแล็บ<span>แมงมุม</span><ArrowUpRight size={14}/></a><p>แฟนโปรเจกต์เพื่อการสร้างสรรค์ · โมเดล สามมิติ ตีความใหม่จากภาพยนตร์<br/><span>สไปเดอร์แมน และตัวละครเป็นของ มาร์เวล / โซนี พิคเจอร์ส ไม่มีความเกี่ยวข้องกับผู้สร้างภาพยนตร์</span></p><a href="#lab">กลับขึ้นด้านบน<ArrowRight size={13}/></a></footer>
    {tracker&&<TrackerSimulator onClose={()=>setTracker(false)}/>}
    <dialog ref={aboutRef} className="about-dialog" aria-label="เกี่ยวกับ ห้องแล็บแมงมุม" onCancel={()=>setAbout(false)} onClose={()=>setAbout(false)}><button className="icon-btn about-close" onClick={()=>setAbout(false)} aria-label="ปิดข้อมูลเกี่ยวกับเว็บ"><X size={20}/></button><SpiderMark/><div className="eyebrow">แฟนโปรเจกต์อิสระ</div><h2>ยินดีต้อนรับสู่<br/>ห้องแล็บ<span>แมงมุม</span></h2><p>คลังจัดแสดงสิ่งประดิษฐ์ อุปกรณ์ และพลังจาก สไปเดอร์แมน ทั้ง 3 ยุค: โทบีย์ แมไกวร์, แอนดรูว์ การ์ฟิลด์ และ ทอม ฮอลแลนด์</p><p>โมเดลทั้งหมดเป็นงานออกแบบสามมิติที่สร้างขึ้นใหม่โดยได้แรงบันดาลใจจากภาพยนตร์ กลไกภายในและชิ้นส่วนที่เห็นเป็นการตีความเชิงสร้างสรรค์ ส่วน เครื่องติดตามแมงมุม เป็นการจำลอง ไม่มีการติดตามตำแหน่งจริง</p><p className="about-small">อุปกรณ์ของ ทอม บางส่วนพัฒนาโดย โทนี สตาร์ก และใยชีวภาพของ โทบีย์ เป็นพลังพิเศษ ไม่ใช่สิ่งประดิษฐ์ของ ปีเตอร์</p><button className="primary-btn" onClick={()=>setAbout(false)}>เข้าใจแล้ว เข้าห้องแล็บ<ArrowRight size={16}/></button></dialog>
  </>;
}
