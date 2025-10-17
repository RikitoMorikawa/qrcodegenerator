"use client";

import React, { useEffect, useRef } from "react";
import { useQrStyle } from "@/context/qrStyle";

// 透明な画像を作成する関数
const createTransparentImage = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, 100, 100); // 完全に透明
  }
  return canvas.toDataURL("image/png");
};

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
      // 透明画像を作成
      const transparentImage = createTransparentImage();

      qrRef.current = new QRCodeStyling({
        data: state.text,
        width: 512,
        height: 512,
        margin: 8,
        // 初期化時から読み取り性重視の設定
        qrOptions: {
          errorCorrectionLevel: "H",
          typeNumber: 8, // 高密度で読み取り性向上
        },
        dotsOptions: {
          type: "square", // デフォルトは四角（読み取り最適化）
        },
        cornersSquareOptions: {
          type: "square", // デフォルトは四角（読み取り最適化）
        },
        cornersDotOptions: {
          type: "square", // デフォルトは四角（読み取り最適化）
        },
        // 初期状態でも中央をクリアにする
        image: transparentImage,
        imageOptions: {
          margin: -15, // より大きなマイナスマージンで背景スペースを大幅に削減
          imageSize: 0.7, // ロゴを70%に少し縮小
          hideBackgroundDots: true, // 背景は隠してロゴ本体のみクリア
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

  // リサイズ時にQRコードサイズを調整
  useEffect(() => {
    const handleResize = () => {
      updateQr();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const updateQr = () => {
    if (!qrRef.current) return;
    const logoEnabled = Boolean(state.logoDataUrl);

    // スマホ対応: 画面サイズに応じてQRコードサイズを調整
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const qrSize = isMobile ? Math.min(400, window.innerWidth - 60) : 512;

    // Always pass imageOptions to avoid lib accessing undefined.hideBackgroundDots
    const imageOptions = {
      crossOrigin: "anonymous",
      margin: -15, // より大きなマイナスマージンで背景スペースを大幅に削減
      imageSize: 0.7, // ロゴエリアは統一して70%
      hideBackgroundDots: true, // 背景は隠してロゴ本体のみクリア
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
      width: qrSize, // レスポンシブサイズ
      height: qrSize, // レスポンシブサイズ
      margin: 8, // 適度なマージンでクワイエットゾーンを確保
      qrOptions: {
        errorCorrectionLevel: "H", // 最高エラー訂正レベル（30%まで復元可能）
        mode: "Byte",
        typeNumber: 8, // 高密度でより多くのQRコード領域を確保
      },
      backgroundOptions: {
        color: state.bgColor,
        gradient: null,
      },
      // カスタマイズ可能なスタイル
      dotsOptions: {
        type: state.dotsStyle, // 選択されたドットスタイル
        color: state.color,
        gradient: null,
      },
      // カスタマイズ可能なコーナー
      cornersSquareOptions: {
        type: state.cornersStyle, // 選択されたコーナースタイル
        color: state.color,
        gradient: null,
      },
      cornersDotOptions: {
        type: state.cornersStyle, // 選択されたコーナースタイル
        color: state.color,
        gradient: null,
      },
      // 常に画像を設定（ロゴがない場合は透明画像で中央をクリア）
      image: logoEnabled ? state.logoDataUrl : createTransparentImage(),
      imageOptions,
    });
  };

  const handleDownload = async (ext: "png" | "jpeg" | "webp" | "svg") => {
    if (!qrRef.current) return;
    await qrRef.current.download({ extension: ext, name: "qr-code" });
  };

  const saveQRCodeToGallery = async () => {
    if (!qrRef.current) return;

    try {
      // QRコードをBlobとして取得（より確実な方法）
      const blob = await qrRef.current.getRawData("png");
      if (!blob) {
        throw new Error("QRコードの画像データを取得できませんでした");
      }

      // BlobをBase64に変換
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // QRコードの情報を構築
      const qrInfo = {
        url: state.text,
        logoType: state.logoDataUrl ? "AI生成ロゴ" : "ロゴなし",
        style: `${state.dotsStyle}ドット・${state.cornersStyle}コーナー`,
        colors: `QR:${state.color} / 背景:${state.bgColor}`,
      };

      console.log("Saving QR code:", { qrInfo, dataUrlLength: dataUrl.length });

      // Supabaseに保存
      const response = await fetch("/api/save-qrcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrDataUrl: dataUrl,
          qrInfo,
          isPublic: true,
        }),
      });

      const result = await response.json();
      console.log("Save QR code result:", result);

      if (response.ok) {
        alert("QRコードをギャラリーに保存しました！");
        // ギャラリーを更新するためのイベントを発火
        window.dispatchEvent(new CustomEvent("qrcode-saved"));
      } else {
        throw new Error(result.error || "保存に失敗しました");
      }
    } catch (error) {
      console.error("QRコード保存エラー:", error);
      alert(`QRコードの保存に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
      <div
        className="rounded-lg border p-2 max-w-full overflow-hidden flex items-center justify-center"
        style={{
          width: "min(528px, 100%)", // スマホでは画面幅に合わせる
          height: "min(528px, calc(100vw - 40px))", // スマホでは正方形に調整、若干上下スペース追加
          backgroundColor: state.bgColor, // プレビューコンテナも背景色に合わせる
        }}
      >
        <div ref={containerRef} className="flex items-center justify-center" style={{ maxWidth: "100%" }} />
      </div>
      <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
        <button className="btn text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2" onClick={() => handleDownload("png")}>
          PNG
        </button>
        <button className="btn text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2" onClick={() => handleDownload("jpeg")}>
          JPEG
        </button>
        <button className="btn text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2" onClick={() => handleDownload("webp")}>
          WEBP
        </button>
        <button className="btn text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2" onClick={() => handleDownload("svg")}>
          SVG
        </button>
        <button className="btn btn-primary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2" onClick={saveQRCodeToGallery}>
          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          公開
        </button>
      </div>
    </div>
  );
}
