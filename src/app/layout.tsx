import type { Metadata } from "next";
import { notoSansSC, notoSerifSC } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Untitled · 雅集",
  description: "Untitled 读书会活动作品留痕站 — 记录与分享属于我们自己的美。",
};

export default function RootLayout({
  children,
  ...props
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${notoSansSC.variable} ${notoSerifSC.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-paper text-ink selection:bg-orchid-light/30">
        {children}
      </body>
    </html>
  );
}
