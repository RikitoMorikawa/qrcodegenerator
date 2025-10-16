"use client";

import React, { useState } from "react";
import Controls from "@/components/Controls";
import QRCodePreview from "@/components/QRCodePreview";
import HelpModal from "@/components/HelpModal";
import { QrStyleProvider } from "@/context/qrStyle";

export default function Home() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <QrStyleProvider>
      <div className="min-h-screen p-6 sm:p-10 relative overflow-hidden">
        {/* decorative blobs */}
        <div className="blob blob-pink" style={{ width: 260, height: 260, top: -60, left: -40 }} />
        <div className="blob blob-sky" style={{ width: 320, height: 320, top: 120, right: -80 }} />
        <div className="blob blob-lime" style={{ width: 280, height: 280, bottom: -60, left: 120 }} />

        {/* Help Button */}
        <button
          onClick={() => setIsHelpOpen(true)}
          className="fixed top-6 right-10 z-40 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-110 group"
          title="使い方ガイド"
        >
          <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        <div className="container relative">
          <header className="header">
            <div>
              <div className="title">AI QR Code Generator</div>
              <div className="subtitle">テキスト、ロゴ、カラーを自在に。AIロゴ生成にも対応。</div>
            </div>
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

        {/* Help Modal */}
        <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      </div>
    </QrStyleProvider>
  );
}
