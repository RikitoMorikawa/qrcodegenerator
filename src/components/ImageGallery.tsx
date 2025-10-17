"use client";

import React, { useEffect, useState } from "react";
import { GeneratedImage } from "@/lib/supabase";

// 装飾的なQRコードパターンコンポーネント
const QRPattern = () => {
  // 固定パターンを生成（毎回同じパターン）
  const generateFixedPattern = () => {
    const pattern = [
      1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1,
      0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1,
      0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1,
    ];
    return pattern;
  };

  const pattern = generateFixedPattern();

  return (
    <div className="w-full h-full relative bg-white">
      {/* コーナーの位置検出パターン */}
      <div className="absolute top-2 left-2 w-8 h-8 border-2 border-black">
        <div className="absolute top-1.5 left-1.5 w-3 h-3 bg-black"></div>
      </div>
      <div className="absolute top-2 right-2 w-8 h-8 border-2 border-black">
        <div className="absolute top-1.5 right-1.5 w-3 h-3 bg-black"></div>
      </div>
      <div className="absolute bottom-2 left-2 w-8 h-8 border-2 border-black">
        <div className="absolute bottom-1.5 left-1.5 w-3 h-3 bg-black"></div>
      </div>

      {/* 固定ドットパターン */}
      <div className="absolute inset-12 grid grid-cols-12 gap-0.5">
        {pattern.map((filled, i) => (
          <div key={i} className={`w-full h-full rounded-sm ${filled ? "bg-black" : "bg-transparent"}`} />
        ))}
      </div>

      {/* タイミングパターン（水平・垂直線） */}
      <div className="absolute top-10 left-12 right-12 h-0.5 bg-black opacity-70"></div>
      <div className="absolute left-10 top-12 bottom-12 w-0.5 bg-black opacity-70"></div>
    </div>
  );
};

export default function ImageGallery() {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();

    // QRコード保存イベントをリッスン
    const handleQRCodeSaved = () => {
      fetchImages();
    };

    window.addEventListener("qrcode-saved", handleQRCodeSaved);
    return () => window.removeEventListener("qrcode-saved", handleQRCodeSaved);
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      console.log("Fetching images from API...");
      const response = await fetch("/api/images");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch images");
      }

      console.log("Images fetched:", data.images);
      setImages(data.images);
    } catch (err) {
      console.error("Error fetching images:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const getStyleLabel = (styleType: string) => {
    const styleLabels: Record<string, string> = {
      normal: "未設定",
      cute: "可愛い",
      cool: "カッコイイ",
      elegant: "オシャレ",
      playful: "元気",
      retro: "レトロ",
      qrcode: "QRコード",
    };
    return styleLabels[styleType] || styleType;
  };

  const getImageTypeIcon = (styleType: string) => {
    if (styleType === "qrcode") {
      return (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-6l3-3 2 2 5-5 2 2zm0 0l-3-3" />
        </svg>
      );
    }
    return (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="card p-6">
        <h2 className="title mb-4">生成された画像</h2>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-gray-400">画像を読み込み中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <h2 className="title mb-4">生成された画像</h2>
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-lg font-semibold">エラーが発生しました</p>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
          </div>
          <button onClick={fetchImages} className="btn btn-primary">
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="title">生成された画像</h2>
        <button onClick={fetchImages} className="btn text-sm" disabled={loading}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          更新
        </button>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-lg font-semibold">まだ画像がありません</p>
            <p className="text-sm text-gray-500 mt-1">AIロゴを生成して保存すると、ここに表示されます</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {/* QR部分（白背景） */}
              <div className="aspect-square relative overflow-hidden bg-white">
                {/* 装飾的なQRコードパターン背景 */}
                <div className="absolute inset-0 opacity-30">
                  <QRPattern />
                </div>

                {/* メイン画像エリア */}
                <div className="absolute inset-6 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.image_url}
                    alt={image.prompt}
                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-200 drop-shadow-sm"
                    loading="lazy"
                    style={{
                      backgroundColor: "transparent",
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-white/10 transition-colors duration-200 rounded" />
                </div>
              </div>

              {/* 説明部分（ダーク背景） */}
              <div className="p-3 bg-gray-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${
                      image.style_type === "qrcode" ? "bg-green-500/20 text-green-300" : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {getImageTypeIcon(image.style_type)}
                    {getStyleLabel(image.style_type)}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(image.created_at).toLocaleDateString("ja-JP")}</span>
                </div>

                <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">{image.original_prompt || image.prompt}</p>
              </div>

              {/* ホバー時のオーバーレイ */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <button
                  onClick={() => window.open(image.image_url, "_blank")}
                  className="bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  拡大表示
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
