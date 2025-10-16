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
      qrRef.current = new QRCodeStyling({
        data: state.text,
        width: 512,
        height: 512,
        // 初期化時から高品質設定
        dotsOptions: {
          type: "rounded",
        },
      });
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
      // 超高品質レンダリング設定
      quality: 1.0,
      smoothing: true,
      // エッジの品質向上
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high",
    };
    qrRef.current.update({
      data: state.text,
      width: 512, // 512px固定
      height: 512, // 512px固定
      margin: 0, // マージンを0にして背景色が全範囲に適用されるように
      qrOptions: {
        errorCorrectionLevel: "H", // 高いエラー訂正レベルでロゴがあっても読み取り可能
        mode: "Byte",
        typeNumber: 0, // 自動選択
      },
      backgroundOptions: {
        color: state.bgColor,
        // 高品質背景レンダリング
        gradient: null,
      },
      dotsOptions: {
        type: state.dotsStyle,
        color: state.color,
        // エッジの品質向上
        gradient: null,
      },
      cornersSquareOptions: {
        type: state.cornersStyle,
        color: state.color,
        gradient: null,
      },
      cornersDotOptions: {
        type: state.cornersStyle,
        color: state.color,
        gradient: null,
      },
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
      <div
        className="rounded-lg border p-2"
        style={{
          width: 528, // 512px + 16px (固定)
          backgroundColor: state.bgColor, // プレビューコンテナも背景色に合わせる
        }}
      >
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
