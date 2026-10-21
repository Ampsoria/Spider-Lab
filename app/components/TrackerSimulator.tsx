"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Crosshair, Radio, ScanLine, Signal, X } from "lucide-react";
import "./tracker.css";
import { useLanguage, type Translate } from "../i18n/LanguageProvider";

type TrackerSimulatorProps = { onClose: () => void };

const getBeacons = (t: Translate) => [
  { id: t("จุด-01"), name: t("ควีนส์"), zone: t("ฐานสังเกตการณ์ควีนส์"), x: 74, y: 64, signal: 91, distance: 1.4, sector: t("ค-07") },
  { id: t("จุด-02"), name: t("มิดทาวน์"), zone: t("ดาดฟ้ามิดทาวน์"), x: 43, y: 37, signal: 84, distance: 3.2, sector: t("ม-12") },
  { id: t("จุด-03"), name: t("บรูคลิน"), zone: t("สะพานบรูคลิน"), x: 44, y: 77, signal: 78, distance: 4.8, sector: t("บ-04") },
];

const offsets = [
  { x: 0, y: 0, signal: 0, distance: 0 },
  { x: 3, y: -3, signal: 3, distance: -0.2 },
  { x: -2, y: -5, signal: -2, distance: 0.1 },
  { x: -4, y: 1, signal: 1, distance: -0.1 },
];

export default function TrackerSimulator({ onClose }: TrackerSimulatorProps) {
  const { t } = useLanguage();
  const beacons = getBeacons(t);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scanCounts, setScanCounts] = useState([0, 0, 0]);
  const [scanning, setScanning] = useState(false);
  const active = beacons[activeIndex];
  const scanCount = scanCounts[activeIndex];
  const offset = offsets[scanCount % offsets.length];

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  function selectBeacon(index: number) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setScanning(false);
    setActiveIndex(index);
  }

  function scan() {
    if (scanning) return;
    setScanning(true);
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 400 : 1500;
    timerRef.current = setTimeout(() => {
      setScanCounts((counts) => counts.map((count, index) => index === activeIndex ? count + 1 : count));
      setScanning(false);
      timerRef.current = null;
    }, duration);
  }

  return (
    <dialog
      ref={dialogRef}
      className="tracker-dialog"
      aria-labelledby="tracker-title"
      aria-describedby="tracker-description"
      onClose={onClose}
    >
      <div className="tracker-panel">
        <header className="tracker-header">
          <div>
            <span className="tracker-eyebrow"><Radio size={12} aria-hidden="true" /> {t("เทคโนโลยีสตาร์ก / อุปกรณ์ภาคสนาม")}</span>
            <h2 id="tracker-title">{t("สไปเดอร์")}<span>—</span>{t("แทร็กเกอร์")}</h2>
          </div>
          <button className="tracker-close" onClick={() => dialogRef.current?.close()} aria-label={t("ปิดระบบติดตาม")}><X size={21} /></button>
        </header>

        <div className="tracker-simulation-bar">
          <span><i /> {t("ระบบจำลอง / พื้นที่สมมติ")}</span>
          <span className="tracker-protocol">{t("ระบบรุ่น 03.17")}</span>
        </div>

        <div className="tracker-body">
          <div className={`tracker-map ${scanning ? "is-scanning" : ""}`} aria-label={t("แผนที่จำลองพร้อมจุดติดตาม 3 จุด")}>
            <div className="tracker-land tracker-land-west" aria-hidden="true" />
            <div className="tracker-land tracker-land-island" aria-hidden="true" />
            <div className="tracker-land tracker-land-east" aria-hidden="true" />
            <div className="tracker-map-bridge tracker-map-bridge-one" aria-hidden="true" />
            <div className="tracker-map-bridge tracker-map-bridge-two" aria-hidden="true" />
            <div className="tracker-radar-rings" aria-hidden="true" />
            <div className="tracker-radar-sweep" aria-hidden="true" />
            <span className="tracker-map-label tracker-label-midtown" aria-hidden="true">{t("มิดทาวน์")}</span>
            <span className="tracker-map-label tracker-label-queens" aria-hidden="true">{t("ควีนส์")}</span>
            <span className="tracker-map-label tracker-label-water" aria-hidden="true">{t("แม่น้ำอีสต์")}</span>
            <span className="tracker-map-north" aria-hidden="true">{t("เหนือ")} <ArrowUpRight size={15} /></span>
            <div className="tracker-map-coordinates" aria-hidden="true">{t("แผนที่เขต")}<br /><span>{t("นิวยอร์ก / พิกัดสมมติ")}</span></div>
            {beacons.map((beacon, index) => {
              const markerOffset = offsets[scanCounts[index] % offsets.length];
              return (
                <button
                  key={beacon.id}
                  className={`tracker-beacon ${index === activeIndex ? "is-selected" : ""}`}
                  style={{ left: `${beacon.x + markerOffset.x}%`, top: `${beacon.y + markerOffset.y}%` }}
                  onClick={() => selectBeacon(index)}
                  aria-label={`${t("เลือกเครื่องติดตาม ")}${beacon.id} ${beacon.name}`}
                  aria-pressed={index === activeIndex}
                >
                  <span className="tracker-beacon-ring" aria-hidden="true" />
                  <Crosshair size={22} aria-hidden="true" />
                  <span className="tracker-beacon-tag" aria-hidden="true">{beacon.id}</span>
                </button>
              );
            })}
            <div className="tracker-map-bottom"><span><i /> {scanning ? t("กำลังสแกนพื้นที่") : t("สัญญาณจำลอง")}</span><span>{t("เครื่องติดตาม 3 จุด")}</span></div>
          </div>

          <section className="tracker-controls" aria-label={t("ควบคุมเครื่องติดตาม")}>
            <div className="tracker-section-caption"><span>{t("เลือกเครื่องติดตาม")}</span><span>01 — 03</span></div>
            <div className="tracker-beacon-list">
              {beacons.map((beacon, index) => (
                <button key={beacon.id} className={`tracker-target ${index === activeIndex ? "is-selected" : ""}`} onClick={() => selectBeacon(index)} aria-pressed={index === activeIndex}>
                  <span className="tracker-target-number">0{index + 1}</span>
                  <span className="tracker-target-name">{beacon.name}<small>{beacon.zone}</small></span>
                  <Signal size={16} aria-hidden="true" />
                </button>
              ))}
            </div>

            <div className="tracker-readout" aria-live="polite" aria-atomic="true">
              <div className="tracker-readout-status"><span className={scanning ? "tracker-status-scanning" : ""}><i /> {scanning ? t("กำลังสแกนพื้นที่จำลอง") : scanCount > 0 ? t("อัปเดตตำแหน่งจำลองแล้ว") : t("พร้อมจำลองการติดตาม")}</span><span>{active.id}</span></div>
              <div className="tracker-metrics">
                <div><span>{t("สัญญาณจำลอง")}</span><strong>{active.signal + offset.signal}<small>%</small></strong></div>
                <div><span>{t("ระยะทางจำลอง")}</span><strong>{(active.distance + offset.distance).toFixed(1)}<small>{t("กม.")}</small></strong></div>
              </div>
              <div className="tracker-signal-meter" aria-hidden="true"><span style={{ width: `${active.signal + offset.signal}%` }} /></div>
              <div className="tracker-readout-footer"><span>{t("เขต")} {active.sector}</span><span>{t("สแกนครั้งที่")} {String(scanCount).padStart(2, "0")}</span></div>
            </div>

            <button className="tracker-scan-button" onClick={scan} disabled={scanning}>
              <ScanLine size={18} aria-hidden="true" />
              {scanning ? t("กำลังสแกน…") : t("สแกนสัญญาณ")}
              <ArrowUpRight size={17} aria-hidden="true" />
            </button>
            <p id="tracker-description" className="tracker-disclaimer">{t("เลือกจุดแล้วสแกนเพื่อทดลองติดตามบนแผนที่สมมติ")}<br />{t("ใช้ข้อมูลจำลอง ไม่เชื่อมต่อ จีพีเอส หรือตำแหน่งจริง")}</p>
          </section>
        </div>

        <footer className="tracker-footer"><span>{t("เทคโนโลยีของฮีโร่เพื่อนบ้าน")}</span><span>{t("คลังสไปเดอร์ / การทดลอง 003")}</span></footer>
      </div>
    </dialog>
  );
}
