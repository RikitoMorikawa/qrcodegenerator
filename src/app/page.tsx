"use client";

import Controls from "@/components/Controls";
import QRCodePreview from "@/components/QRCodePreview";
import { QrStyleProvider } from "@/context/qrStyle";

export default function Home() {
  return (
    <QrStyleProvider>
      <div className="min-h-screen p-6 sm:p-10 relative overflow-hidden">
        {/* decorative blobs */}
        <div className="blob blob-pink" style={{ width: 260, height: 260, top: -60, left: -40 }} />
        <div className="blob blob-sky" style={{ width: 320, height: 320, top: 120, right: -80 }} />
        <div className="blob blob-lime" style={{ width: 280, height: 280, bottom: -60, left: 120 }} />
        <div className="container relative">
          <header className="header">
            <div>
              <div className="title">AI QR Code Generator</div>
              <div className="subtitle">テキスト、ロゴ、カラーを自在に。AIロゴ生成にも対応。</div>
            </div>
            <a className="btn btn-primary" href="https://qrcode.monorepo.example" target="_blank" rel="noreferrer">
              デモについて
            </a>
          </header>
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
            <div className="card p-5">
              <Controls />
            </div>
            <div className="card p-5 flex items-start justify-center">
              <QRCodePreview />
            </div>
          </div>
        </div>
      </div>
    </QrStyleProvider>
  );
}
