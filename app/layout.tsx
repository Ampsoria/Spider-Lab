import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://spider-lab-amp.midweek-tippers-5lv7.chatgpt.site"),
  title: "ห้องแล็บแมงมุม — คลังสิ่งประดิษฐ์",
  description: "สำรวจสิ่งประดิษฐ์ อุปกรณ์ และพลังของ สไปเดอร์แมน ทั้ง 3 ยุค ผ่านโมเดล สามมิติ ที่หมุน ซูม และแยกชิ้นส่วนได้ พร้อม เครื่องติดตามแมงมุม จำลอง",
  openGraph: {
    title: "ห้องแล็บแมงมุม — คลังสิ่งประดิษฐ์",
    description: "สไปเดอร์แมน 3 ยุค อุปกรณ์ 9 ชิ้น สำรวจเทคโนโลยีเบื้องหลังหน้ากากผ่านโมเดล สามมิติ และ เครื่องติดตามแมงมุม จำลอง",
    type: "website",
    locale: "th_TH",
    url: "/",
    siteName: "ห้องแล็บแมงมุม",
  },
  twitter: {
    card: "summary",
    title: "ห้องแล็บแมงมุม — คลังสิ่งประดิษฐ์",
    description: "สำรวจอุปกรณ์ สไปเดอร์แมน ทั้ง 3 ยุค ผ่านประสบการณ์สามมิติ",
  },
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
