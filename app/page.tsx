"use client";

import "@fontsource/kanit/300.css";
import "@fontsource/kanit/400.css";
import "@fontsource/kanit/500.css";
import "@fontsource/kanit/600.css";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, AudioLines, Box, Check, ChevronLeft, ChevronRight, Crosshair, Expand, Layers3, Minus, MousePointer2, Plus, Radar, RotateCcw, ScanLine, VolumeX, X } from "lucide-react";
import { LanguageProvider, useLanguage, type Translate } from "./i18n/LanguageProvider";
import GadgetScene, { type ModelKind } from "./components/GadgetScene";
import TrackerSimulator from "./components/TrackerSimulator";

type HeroId = "tobey" | "andrew" | "tom";
type Gadget = { id: string; name: string; thai: string; type: ModelKind; category: string; description: string; feature: string; material: string };
const getHeroes = (t: Translate): {id:HeroId; actor:string; title:string; year:string; tag:string; color:string; number:string}[] => [
  { id:"tobey", actor:t("โทบีย์ แมไกวร์"), title:t("ฮีโร่คนแรก"), year:"2002 — 2007", tag:t("ไตรภาคแซม ไรมี"), color:"#d7323d", number:"01" },
  { id:"andrew", actor:t("แอนดรูว์ การ์ฟิลด์"), title:t("ฮีโร่ผู้น่าทึ่ง"), year:"2012 — 2014", tag:t("ดิ อะเมซิง สไปเดอร์แมน"), color:"#ed6848", number:"02" },
  { id:"tom", actor:t("ทอม ฮอลแลนด์"), title:t("ฮีโร่รุ่นใหม่"), year:t("2016 — ปัจจุบัน"), tag:t("จักรวาลภาพยนตร์มาร์เวล"), color:"#fa3b46", number:"03" },
];
const getArchive = (t: Translate): Record<HeroId, Gadget[]> => ({
  tom: [
    {id:t("ติดตาม-01"), name:t("เครื่องติดตามแมงมุม"), thai:t("เครื่องติดตามแมงมุม"), type:"tracker", category:t("อุปกรณ์ลาดตระเวน"), description:t("ตัวเล็ก แต่ไม่เคยคลาดสายตา อุปกรณ์ติดตามในธีม โฮมคัมมิง ที่เปลี่ยนแมงมุมตัวจิ๋วให้เป็นผู้ช่วยตามหาเป้าหมาย สำรวจการออกแบบและทดลองส่งสัญญาณในพื้นที่จำลอง"), feature:t("ติดตามสัญญาณ"), material:t("เกราะและวงจรจำลอง")},
    {id:t("ใย-02"), name:t("เครื่องยิงใย"), thai:t("เครื่องยิงใยสตาร์ก"), type:"shooter", category:t("เทคโนโลยีใยแมงมุม"), description:t("เมื่อไอเดียของ ปีเตอร์ พบกับเทคโนโลยีของ โทนี สตาร์ก เครื่องยิงใยจึงพัฒนาไปอีกขั้นด้วยรูปแบบการยิงที่หลากหลาย โมเดลนี้ตีความกลไกขึ้นใหม่สำหรับการจัดแสดง"), feature:t("รูปแบบใยหลากหลาย"), material:t("กลไกข้อมือจำลอง")},
    {id:t("โดรน-03"), name:t("โดรนแมงมุม"), thai:t("โดรนสำรวจแมงมุม"), type:"drone", category:t("อุปกรณ์สำรวจทางอากาศ"), description:t("ผู้ช่วยสำรวจที่แยกตัวออกจากตราแมงมุมบนอกชุดใน โฮมคัมมิง เปิดมุมมองใหม่ให้ ปีเตอร์ ด้วยอุปกรณ์ขนาดเล็กที่พร้อมออกบิน"), feature:t("สำรวจทางอากาศ"), material:t("โครงโดรนจำลอง")},
  ],
  andrew: [
    {id:t("ใย-01"), name:t("เครื่องยิงใย"), thai:t("เครื่องยิงใยอเมซิง"), type:"shooter", category:t("สิ่งประดิษฐ์ของปาร์กเกอร์"), description:t("เริ่มต้นจากโต๊ะทำงานของ ปีเตอร์ สู่เครื่องยิงใยที่เขาออกแบบและประกอบขึ้นเอง ความคิดแบบนักประดิษฐ์ที่ทำให้ สไปเดอร์แมน โหนผ่านตึกสูงได้อย่างคล่องตัว"), feature:t("สิ่งประดิษฐ์ของ ปีเตอร์"), material:t("กลไกข้อมือจำลอง")},
    {id:t("ตลับ-02"), name:t("ตลับใยแมงมุม"), thai:t("ตลับใยแมงมุม"), type:"cartridge", category:t("เทคโนโลยีใยแมงมุม"), description:t("สำรวจชิ้นส่วนที่ได้แรงบันดาลใจจากระบบใยของ ดิ อะเมซิง สไปเดอร์แมน งานออกแบบสำหรับเว็บนี้เปิดให้ดูตลับและรายละเอียดภายในอย่างใกล้ชิด"), feature:t("แยกดูส่วนประกอบ"), material:t("ตลับใยจำลอง")},
    {id:t("หน้ากาก-03"), name:t("หน้ากากอเมซิง"), thai:t("หน้ากากอเมซิง"), type:"mask", category:t("การออกแบบชุด"), description:t("หน้ากากตาข่ายสีแดงและเลนส์โทนทองที่ได้แรงบันดาลใจจาก ดิ อะเมซิง สไปเดอร์แมน ปี 2012 รูปทรงเพรียวและดุดันในแบบของ แอนดรูว์ การ์ฟิลด์"), feature:t("เลนส์โทนทอง"), material:t("ผิวตาข่ายจำลอง")},
  ],
  tobey: [
    {id:t("หน้ากาก-01"), name:t("หน้ากากคลาสสิก"), thai:t("หน้ากากคลาสสิก"), type:"mask", category:t("การออกแบบชุด"), description:t("สีแดง ลายใย และดวงตาที่เป็นภาพจำ หน้ากากที่ได้แรงบันดาลใจจาก สไปเดอร์แมน ของ แซม ไรมี จุดเริ่มต้นของฮีโร่ข้างบ้านบนจอภาพยนตร์"), feature:t("ลายใยนูนคลาสสิก"), material:t("ผิวชุดจำลอง")},
    {id:t("ชีวภาพ-02"), name:t("ใยชีวภาพ"), thai:t("ใยชีวภาพ"), type:"web", category:t("พลังทางชีวภาพ"), description:t("สไปเดอร์แมน เวอร์ชัน โทบีย์ ปล่อยใยจากข้อมือด้วยพลังทางชีวภาพ จึงไม่มีเครื่องยิงใยแบบกลไก ชิ้นจัดแสดงนี้จำลองเส้นใยและจัดอยู่ในหมวดพลังพิเศษ"), feature:t("พลังพิเศษทางชีวภาพ"), material:t("โครงข่ายเส้นใยจำลอง")},
    {id:t("กล้อง-03"), name:t("กล้องของปีเตอร์"), thai:t("กล้องของปีเตอร์"), type:"camera", category:t("อุปกรณ์คู่ใจ"), description:t("ก่อนจะเป็นภาพหน้าหนึ่งของ เดลีบิวเกิล ก็ต้องผ่านเลนส์ของ ปีเตอร์ ปาร์กเกอร์ อุปกรณ์คู่ใจของช่างภาพหนุ่มที่มีมุมถ่าย สไปเดอร์แมน ไม่เหมือนใคร"), feature:t("อุปกรณ์ช่างภาพ"), material:t("กล้องตีความใหม่")},
  ],
});

function SpiderMark({className=""}:{className?:string}) {
  return <span className={`spider-mark ${className}`} aria-hidden="true"><i/><b/>{Array.from({length:8},(_,i)=><span key={i} style={{"--leg":i} as React.CSSProperties}/>)}</span>;
}

function Intro({ready,onDone}:{ready:boolean;onDone:()=>void}) {
  const { t } = useLanguage();
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
  return <div className={`intro ${leaving?"intro-leaving":""}`} aria-label={t("กำลังเข้าสู่ ห้องแล็บแมงมุม")} role="status"><div className="intro-web"/><div className="intro-core"><SpiderMark/><p>{t("ห้องแล็บ")}<span>{t("แมงมุม")}</span></p><div className="intro-meter"><span style={{width:`${progress}%`}}/></div><div className="intro-status"><span>{progress<40?t("กำลังเตรียมระบบ"):progress<85?t("เชื่อมต่อจักรวาลแมงมุม"):t("ยินดีต้อนรับสู่ห้องแล็บ")}</span><span>{String(progress).padStart(3,"0")}%</span></div></div><span className="intro-bottom">{t("พลังอันยิ่งใหญ่ มาพร้อมไอเดียที่ยิ่งกว่า")}</span></div>;
}

export default function Home() {
  return <LanguageProvider><HomeContent/></LanguageProvider>;
}

function HomeContent() {
  const { t, language, setLanguage } = useLanguage();
  const heroes = getHeroes(t);
  const archive = getArchive(t);
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
    <a href="#lab" className="skip-link">{t("ข้ามไปยังโมเดล สามมิติ")}</a>
    <header className="site-header"><a href="#lab" className="brand" aria-label={t("ห้องแล็บแมงมุม หน้าหลัก")}><SpiderMark/><span>{t("ห้องแล็บ")}<span className="brand-lab">{t("แมงมุม")}</span><small>{t("คลังสิ่งประดิษฐ์")}</small></span></a><nav aria-label={t("เมนูหลัก")}><a className="nav-active" href="#archive">{t("คลังอุปกรณ์")}<span>01</span></a><button onClick={openTracker}>{t("เครื่องติดตาม")}<ArrowUpRight size={13}/></button><button onClick={()=>setAbout(true)}>{t("เกี่ยวกับแล็บ")}</button></nav><div className="language-switch" role="group" aria-label={language === "th" ? "เลือกภาษา / Language" : "Language / เลือกภาษา"}>{(["th", "en"] as const).map(locale => <button key={locale} lang={locale} aria-pressed={language === locale} aria-label={locale === "th" ? "ภาษาไทย" : "English"} onClick={() => setLanguage(locale)}>{locale.toUpperCase()}</button>)}</div><div className="header-status"><span className="status-dot"/>{t("ทุกระบบพร้อม")}</div><button className="icon-btn sound-btn" onClick={toggleSound} aria-label={sound?t("ปิดเสียงเอฟเฟกต์"):t("เปิดเสียงเอฟเฟกต์")} aria-pressed={sound}>{sound?<AudioLines size={18}/>:<VolumeX size={18}/>}</button></header>

    <main>
      <section className={`hero-section ${cinema?"cinema-mode":""}`} id="lab" aria-label={t("ห้องแล็บโมเดลสามมิติ")}>
        <div className="hero-grid"/><div className="hero-watermark" aria-hidden="true">{t("แมงมุม")}</div>
        <div className="lab-topline"><span><span className="tiny-cross">+</span> {t("ห้องวิจัยของปีเตอร์ ปาร์กเกอร์")}</span><span>{t("เริ่มต้นปี 2002")} <span className="topline-slash">/</span> {t("นครนิวยอร์ก")}</span></div>
        <div className="hero-copy"><div className="eyebrow"><span className="red-line"/>{t("เบื้องหลังฮีโร่ คือความคิดที่ไม่ธรรมดา")}</div><h1>{t("พลังยิ่งใหญ่")}<br/><span>{t("ไอเดีย")}</span><br/>{t("ยิ่งกว่า")}<span className="red-period">.</span></h1><p className="hero-intro">{t("เบื้องหลังหน้ากาก คือความคิดที่ไม่ธรรมดา")}<br/>{t("สำรวจสิ่งประดิษฐ์ อุปกรณ์ และพลังของ สไปเดอร์แมน")}<br className="desktop-break"/> {t("ทั้ง 3 ยุค ผ่านประสบการณ์สามมิติ")}</p><a href="#archive" className="primary-btn" onClick={beep}>{t("เข้าสู่คลังสิ่งประดิษฐ์")}<ArrowDown size={17}/></a><div className="hero-note"><Box size={14}/><span>{t("3 ฮีโร่")}<span className="note-divider"/>{t("9 ชิ้นจัดแสดง")}<span className="note-divider"/>{t("ตำนานเดียวกัน")}</span></div></div>
        <div className="model-stage">
          <div className="stage-orbit orbit-one"/><div className="stage-orbit orbit-two"/>
          <div className="model-index"><span>{t("ชิ้นจัดแสดง /")} {item.id}</span><div><span className="status-dot"/> {t("สามมิติแบบโต้ตอบ")}</div></div>
          <div className="model-canvas"><GadgetScene kind={item.type} accent={hero.color} exploded={exploded} autoRotate={autoRotate} zoom={zoom} resetKey={resetKey} onReady={onReady}/></div>
          <div className="model-callout callout-one"><span className="callout-line"/><span>{exploded?t("มุมมองแยกชิ้นส่วน"):t("ออกแบบให้เหนือชั้น")}<small>{exploded?t("สำรวจชิ้นส่วนภายใน"):t("รายละเอียดที่ซ่อนอยู่เบื้องหลังพลัง")}</small></span></div>
          <div className="model-callout callout-two"><span className="callout-point"/><span>{item.feature}<small>{t("แบบจำลอง /")} {item.id}</small></span></div>
          <div className="model-ground-label" aria-hidden="true">{item.id}<span>{t("คลังอุปกรณ์ต้นแบบ")}</span></div>
          <div className="viewer-bottom"><div className="drag-hint"><MousePointer2 size={13}/><span>{t("ลากเพื่อหมุน · เลื่อนหรือจีบนิ้วเพื่อซูม")}</span></div><button className="icon-btn cinema-btn" onClick={()=>setCinema(v=>!v)} aria-label={cinema?t("ออกจากมุมมองเต็มจอ"):t("เปิดมุมมองเต็มจอ")} aria-pressed={cinema}>{cinema?<X size={17}/>:<Expand size={17}/>}</button></div>
        </div>
        <div className="viewer-controls" aria-label={t("ควบคุมโมเดล สามมิติ")}><div className="control-label"><span className="red-square"/> {t("สำรวจรายละเอียด")}</div><div className="control-group"><button onClick={()=>{setAutoRotate(v=>!v);beep();}} className={autoRotate?"active":""} aria-pressed={autoRotate}><RotateCcw size={15}/><span>{t("หมุนอัตโนมัติ")}</span></button><button onClick={()=>{setExploded(v=>!v);beep();}} className={exploded?"active":""} aria-pressed={exploded}><Layers3 size={16}/><span>{t("แยกชิ้นส่วน")}</span></button><span className="control-separator"/><button onClick={()=>setZoom(z=>Math.max(.65,Math.round((z-.2)*100)/100))} disabled={zoom<=.65} aria-label={t("ซูมออก")}><Minus size={16}/></button><span className="zoom-value" aria-live="polite">{Math.round(zoom*100)}%</span><button onClick={()=>setZoom(z=>Math.min(2,Math.round((z+.2)*100)/100))} disabled={zoom>=2} aria-label={t("ซูมเข้า")}><Plus size={16}/></button><button onClick={reset} aria-label={t("รีเซ็ตมุมมอง")}><Crosshair size={16}/></button></div><span className="controls-shortcut">{t("แสดงผลทันที")}</span></div>
      </section>

      <section className="archive-section" id="archive">
        <div className="section-heading"><div><div className="eyebrow"><span className="red-line"/>{t("นักประดิษฐ์ใต้หน้ากาก")}</div><h2>{t("แมงมุมสามยุค")} <span>{t("ไอเดียไร้ขีดจำกัด")}</span></h2></div><span className="section-number">01 — 03</span></div>
        <div className="hero-selector" role="group" aria-label={t("เลือก สไปเดอร์แมน")}>
          {heroes.map(h=><button key={h.id} className={`hero-card hero-${h.id} ${heroId===h.id?"selected":""}`} onClick={()=>select(h.id)} aria-pressed={heroId===h.id}><div className="hero-card-number">{h.number}<span>{h.year}</span></div><div className="mask-art" aria-hidden="true"><div className="mask-face"><i/><b/></div></div><div className="hero-card-copy"><span>{h.title}</span><h3>{h.actor}</h3><p>{h.tag}</p></div><span className="hero-card-select">{heroId===h.id?<Check size={16}/>:<ArrowUpRight size={18}/>}</span></button>)}
        </div>

        <div className="archive-detail"><div className="gadget-list"><div className="list-heading"><span>{t("คลังอุปกรณ์")}</span><span>0{gadgets.length} {t("ชิ้น")}</span></div>{gadgets.map((g,i)=><button className={`gadget-row ${index===i?"selected":""}`} key={g.id} onClick={()=>select(heroId,i)} aria-pressed={index===i}><span className="gadget-num">0{i+1}</span><span className="gadget-row-info"><strong>{g.name}</strong><span>{g.thai}</span></span>{index===i?<span className="viewing-badge">{t("กำลังดู")}</span>:<ArrowUpRight size={17}/>}</button>)}</div><article className="gadget-detail" aria-live="polite"><div className="gadget-detail-top"><span className="eyebrow">{item.category}</span><span className="object-chip">{item.id}</span></div><h3>{item.name}<span>{item.thai}</span></h3><p>{item.description}</p><div className="detail-specs"><div><span>{t("คอลเลกชัน")}</span><strong>{hero.actor}</strong></div><div><span>{t("ประเภทชิ้นจัดแสดง")}</span><strong>{item.material}</strong></div></div><div className="detail-actions"><a href="#lab" className="text-btn" onClick={()=>{setZoom(1.3);beep();}}>{t("สำรวจโมเดล สามมิติ")}<ArrowUpRight size={16}/></a>{item.type==="tracker"&&<button className="text-btn tracker-link" onClick={openTracker}>{t("ทดลองติดตาม")}<Radar size={16}/></button>}<div className="item-pagination"><button className="icon-btn" aria-label={t("อุปกรณ์ก่อนหน้า")} onClick={()=>select(heroId,(index+gadgets.length-1)%gadgets.length)}><ChevronLeft size={16}/></button><span>{index+1} / {gadgets.length}</span><button className="icon-btn" aria-label={t("อุปกรณ์ถัดไป")} onClick={()=>select(heroId,(index+1)%gadgets.length)}><ChevronRight size={16}/></button></div></div></article></div>
      </section>

      <section className="tracker-banner"><div className="banner-radar" aria-hidden="true"><i/><b/><span/><div/></div><div className="tracker-banner-copy"><div className="eyebrow"><span className="status-dot"/>{t("เครื่องติดตามแมงมุม / ทดลองภาคสนาม")}</div><h2>{t("อุปกรณ์จิ๋ว")}<br/><span>{t("สัมผัสแมงมุมที่ยิ่งใหญ่")}</span></h2><p>{t("สวมบทบาท ปีเตอร์ ส่งสัญญาณและค้นหาเป้าหมาย")}<br/>{t("ทดลอง เครื่องติดตามแมงมุม ในพื้นที่จำลองของนิวยอร์ก")}</p><button className="primary-btn" onClick={openTracker}>{t("เปิดระบบติดตาม")}<Radar size={18}/></button></div><div className="banner-coordinate"><ScanLine size={21}/><span>{t("เขตนิวยอร์ก — 03")}<small>{t("พื้นที่จำลอง")}</small></span></div></section>
      <div className="closing-line"><span>“</span>{t("พลังอันยิ่งใหญ่ มาพร้อมความรับผิดชอบอันใหญ่ยิ่ง")}<span>”</span></div>
    </main>

    <footer><a href="#lab" className="footer-brand">{t("ห้องแล็บ")}<span>{t("แมงมุม")}</span><ArrowUpRight size={14}/></a><p>{t("แฟนโปรเจกต์เพื่อการสร้างสรรค์ · โมเดล สามมิติ ตีความใหม่จากภาพยนตร์")}<br/><span>{t("สไปเดอร์แมน และตัวละครเป็นของ มาร์เวล / โซนี พิคเจอร์ส ไม่มีความเกี่ยวข้องกับผู้สร้างภาพยนตร์")}</span></p><a href="#lab">{t("กลับขึ้นด้านบน")}<ArrowRight size={13}/></a></footer>
    {tracker&&<TrackerSimulator onClose={()=>setTracker(false)}/>}
    <dialog ref={aboutRef} className="about-dialog" aria-label={t("เกี่ยวกับ ห้องแล็บแมงมุม")} onCancel={()=>setAbout(false)} onClose={()=>setAbout(false)}><button className="icon-btn about-close" onClick={()=>setAbout(false)} aria-label={t("ปิดข้อมูลเกี่ยวกับเว็บ")}><X size={20}/></button><SpiderMark/><div className="eyebrow">{t("แฟนโปรเจกต์อิสระ")}</div><h2>{t("ยินดีต้อนรับสู่")}<br/>{t("ห้องแล็บ")}<span>{t("แมงมุม")}</span></h2><p>{t("คลังจัดแสดงสิ่งประดิษฐ์ อุปกรณ์ และพลังจาก สไปเดอร์แมน ทั้ง 3 ยุค: โทบีย์ แมไกวร์, แอนดรูว์ การ์ฟิลด์ และ ทอม ฮอลแลนด์")}</p><p>{t("โมเดลทั้งหมดเป็นงานออกแบบสามมิติที่สร้างขึ้นใหม่โดยได้แรงบันดาลใจจากภาพยนตร์ กลไกภายในและชิ้นส่วนที่เห็นเป็นการตีความเชิงสร้างสรรค์ ส่วน เครื่องติดตามแมงมุม เป็นการจำลอง ไม่มีการติดตามตำแหน่งจริง")}</p><p className="about-small">{t("อุปกรณ์ของ ทอม บางส่วนพัฒนาโดย โทนี สตาร์ก และใยชีวภาพของ โทบีย์ เป็นพลังพิเศษ ไม่ใช่สิ่งประดิษฐ์ของ ปีเตอร์")}</p><button className="primary-btn" onClick={()=>setAbout(false)}>{t("เข้าใจแล้ว เข้าห้องแล็บ")}<ArrowRight size={16}/></button></dialog>
  </>;
}
