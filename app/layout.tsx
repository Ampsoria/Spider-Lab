import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://spider-lab-amp.midweek-tippers-5lv7.chatgpt.site"),
  title: "SPIDER LAB — The Invention Archive",
  description: "สำรวจสิ่งประดิษฐ์ อุปกรณ์ และพลังของ Spider-Man ทั้ง 3 ยุค ผ่านโมเดล 3D ที่หมุน ซูม และแยกชิ้นส่วนได้ พร้อม Spider Tracker จำลอง",
  openGraph: {
    title: "SPIDER LAB — The Invention Archive",
    description: "3 Spider-Men. 9 exhibits. สำรวจเทคโนโลยีเบื้องหลังหน้ากากผ่านโมเดล 3D และ Spider Tracker จำลอง",
    type: "website",
    locale: "th_TH",
    url: "/",
    siteName: "SPIDER LAB",
  },
  twitter: {
    card: "summary",
    title: "SPIDER LAB — The Invention Archive",
    description: "สำรวจอุปกรณ์ Spider-Man ทั้ง 3 ยุค ผ่านประสบการณ์สามมิติ",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
