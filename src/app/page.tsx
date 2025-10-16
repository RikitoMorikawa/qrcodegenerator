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
      <div className="min-h-screen p-3 sm:p-6 lg:p-10 relative overflow-hidden">
        {/* decorative blobs - スマホでは小さく */}
        <div className="blob blob-pink" style={{ width: 180, height: 180, top: -40, left: -30 }} />
        <div className="blob blob-sky" style={{ width: 220, height: 220, top: 80, right: -60 }} />
        <div className="blob blob-lime" style={{ width: 200, height: 200, bottom: -40, left: 80 }} />

        {/* Help Button - スマホでは小さく、位置調整 */}
        <button
          onClick={() => setIsHelpOpen(true)}
          className="fixed top-4 right-4 sm:top-6 sm:right-10 z-40 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full p-2 sm:p-3 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-110 group"
          title="使い方ガイド"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="subtitle">
                テキスト、ロゴ、カラーを自在に。
                <br className="sm:hidden" />
                AIロゴ生成にも対応。
              </div>
            </div>
          </header>
          <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div className="card p-3 sm:p-4 lg:p-5">
              <Controls />
            </div>
            <div className="card p-3 sm:p-4 lg:p-5 flex items-start justify-center">
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
