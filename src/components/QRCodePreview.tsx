"use client";

import React, { useEffect, useRef } from "react";
import { useQrStyle } from "@/context/qrStyle";

export default function QRCodePreview() {
  const { state } = useQrStyle();
  const containerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const qrRef = useRef<any>(null);

  // client-side only: dynamic import and create instance
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const mod = await import("qr-code-styling");
      if (!isMounted) return;
      const QRCodeStyling = mod.default;
      qrRef.current = new QRCodeStyling({ data: state.text });
      if (containerRef.current) {
        qrRef.current.append(containerRef.current);
      }
      updateQr();
    })();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update when state changes
  useEffect(() => {
    updateQr();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const updateQr = () => {
    if (!qrRef.current) return;
    const logoEnabled = Boolean(state.logoDataUrl);
    // Always pass imageOptions to avoid lib accessing undefined.hideBackgroundDots
    const imageOptions = {
      crossOrigin: "anonymous",
      margin: 0, // ロゴ周りのマージンを削除してQRと馴染ませる
      imageSize: state.logoSizeRatio,
      hideBackgroundDots: true, // 常にロゴ背景のドットを隠す
      saveAsBlob: true, // 透明背景をサポート
    };
    qrRef.current.update({
      data: state.text,
      width: state.size,
      height: state.size,
      margin: state.margin,
      qrOptions: {
        errorCorrectionLevel: "H", // 高いエラー訂正レベルでロゴがあっても読み取り可能
      },
      backgroundOptions: { color: state.bgColor },
      dotsOptions: { type: state.dotsStyle, color: state.color },
      cornersSquareOptions: { type: state.cornersStyle, color: state.color },
      cornersDotOptions: { type: state.cornersStyle, color: state.color },
      image: logoEnabled ? state.logoDataUrl : undefined,
      imageOptions,
    });
  };

  const handleDownload = async (ext: "png" | "jpeg" | "webp" | "svg") => {
    if (!qrRef.current) return;
    await qrRef.current.download({ extension: ext, name: "qr-code" });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-lg border p-4 bg-white" style={{ width: state.size + 24 }}>
        <div ref={containerRef} className="flex items-center justify-center" />
      </div>
      <div className="flex gap-2">
        <button className="btn" onClick={() => handleDownload("png")}>
          PNG
        </button>
        <button className="btn" onClick={() => handleDownload("jpeg")}>
          JPEG
        </button>
        <button className="btn" onClick={() => handleDownload("webp")}>
          WEBP
        </button>
        <button className="btn" onClick={() => handleDownload("svg")}>
          SVG
        </button>
      </div>
    </div>
  );
}
