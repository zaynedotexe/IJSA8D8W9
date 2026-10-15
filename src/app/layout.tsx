import type { Metadata } from "next";
import { Archivo_Black, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import RailNav from "@/components/RailNav";
import StatusBar from "@/components/StatusBar";
import Deterrent from "@/components/Deterrent";

const display = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-display" });
const jbmono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-jbmono" });

export const metadata: Metadata = {
  title: "Lonestar — Underground Digital Collective",
  description: "Lonestar is an underground digital collective. Identity, members, affiliations.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={display.variable + " " + jbmono.variable}>
      <body className="bg-[#050505] text-bone min-h-screen antialiased">
        <Deterrent />
        <RailNav />
        <div className="md:pl-20 pb-12">
          <main className="min-h-[90vh]">{children}</main>
          <footer className="px-5 md:px-10 py-8 flex flex-col md:flex-row gap-2 justify-between mono text-[10px] tracking-[0.3em] text-mist">
            <span>LONESTAR — UNDERGROUND DIGITAL COLLECTIVE</span>
            <span>Made by Ego · Lonestar On Top</span>
          </footer>
        </div>
        <StatusBar />
      </body>
    </html>
  );
}
