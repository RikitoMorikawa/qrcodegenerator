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
  const [isAIImagesExpanded, setIsAIImagesExpanded] = useState(false);
  const [isQRCodesExpanded, setIsQRCodesExpanded] = useState(true); // 初期表示は開いた状態

  useEffect(() => {
    fetchImages();

    // QRコード保存イベントをリッスン
    const handleQRCodeSaved = () => {
      fetchImages();
    };

    // AI生成画像保存イベントをリッスン
    const handleImageSaved = () => {
      fetchImages();
    };

    window.addEventListener("qrcode-saved", handleQRCodeSaved);
    window.addEventListener("image-saved", handleImageSaved);

    return () => {
      window.removeEventListener("qrcode-saved", handleQRCodeSaved);
      window.removeEventListener("image-saved", handleImageSaved);
    };
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/images");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch images");
      }

      setImages(data.images);
    } catch (err) {
      console.error("Error fetching images:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // 画像を種類別に分ける
  const aiGeneratedImages = images.filter((image) => image.style_type !== "qrcode");
  const qrCodeImages = images.filter((image) => image.style_type === "qrcode");

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

  const renderImageSlider = (imageList: GeneratedImage[], isQRCode: boolean = false) => {
    if (imageList.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-gray-500">{isQRCode ? "まだQRコードがありません" : "まだAI画像がありません"}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {imageList.slice(0, 50).map((image) => (
            <div
              key={image.id}
              className="group relative bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200 shadow-sm hover:shadow-md flex-shrink-0 w-48"
            >
              {/* 画像部分（白背景） */}
              <div className="aspect-square relative overflow-hidden bg-white">
                {/* 装飾的なQRコードパターン背景（AI生成画像の場合のみ） */}
                {!isQRCode && (
                  <div className="absolute inset-0 opacity-30">
                    <QRPattern />
                  </div>
                )}

                {/* メイン画像エリア */}
                <div className={`absolute ${!isQRCode ? "inset-6" : "inset-3"} flex items-center justify-center`}>
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
              <div className="p-2 bg-gray-800/50">
                <div className="flex items-center gap-1 mb-1">
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded ${
                      image.style_type === "qrcode" ? "bg-green-500/20 text-green-300" : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {getImageTypeIcon(image.style_type)}
                    {getStyleLabel(image.style_type)}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mb-1">{new Date(image.created_at).toLocaleDateString("ja-JP")}</div>
                <div className="text-xs text-gray-300 line-clamp-2 leading-relaxed">{image.original_prompt || image.prompt}</div>
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
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-8">
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
    <div className="space-y-4">
      {/* AI生成画像セクション */}
      <div className="card">
        <div
          className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-800/30 transition-colors duration-200"
          onClick={() => setIsAIImagesExpanded(!isAIImagesExpanded)}
        >
          <div className={`transform transition-transform duration-300 ${isAIImagesExpanded ? "rotate-90" : ""}`}>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h2 className="title text-lg !mb-0">生成された画像</h2>
        </div>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isAIImagesExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="px-6 pb-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 bg-gray-700/50 px-2 py-1 rounded">全{aiGeneratedImages.length}件</span>
                <span className="text-xs text-gray-500">最新50件まで表示</span>
              </div>
            </div>
            {renderImageSlider(aiGeneratedImages, false)}
          </div>
        </div>
      </div>

      {/* QRコードセクション */}
      <div className="card">
        <div
          className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-800/30 transition-colors duration-200"
          onClick={() => setIsQRCodesExpanded(!isQRCodesExpanded)}
        >
          <div className={`transform transition-transform duration-300 ${isQRCodesExpanded ? "rotate-90" : ""}`}>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h2 className="title text-lg !mb-0">公開されたQRコード</h2>
        </div>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isQRCodesExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="px-6 pb-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 bg-gray-700/50 px-2 py-1 rounded">全{qrCodeImages.length}件</span>
                <span className="text-xs text-gray-500">最新50件まで表示</span>
              </div>
            </div>
            {renderImageSlider(qrCodeImages, true)}
          </div>
        </div>
      </div>
    </div>
  );
}
