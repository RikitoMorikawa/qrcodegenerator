"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Palette, RefreshCw } from "lucide-react";

interface ArtisticQRSample {
  id: string;
  image_url: string;
  prompt: string;
  original_prompt: string;
  style_type: string;
  qr_text: string;
  created_at: string;
}

export default function ArtisticQRSamples() {
  const [samples, setSamples] = useState<ArtisticQRSample[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching artistic QR samples...");
      const response = await fetch("/api/artistic-qr-samples");
      const data = await response.json();

      console.log("API response:", { status: response.status, data });

      if (response.ok) {
        setSamples(data.samples || []);
        setCurrentIndex(0);
        console.log(`Loaded ${data.samples?.length || 0} samples`);
      } else {
        const errorMsg = data.details ? `${data.error}: ${data.details}` : data.error || "サンプルの取得に失敗しました";
        setError(errorMsg);
        console.error("API error:", errorMsg);
      }
    } catch (err) {
      const errorMsg = "ネットワークエラーが発生しました";
      setError(errorMsg);
      console.error("Network error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % samples.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + samples.length) % samples.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-400 border-r-purple-400 animate-spin"
              style={{ width: "48px", height: "48px", left: "-6px", top: "-6px" }}
            />
            <Sparkles size={36} className="text-pink-500 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">アートQRサンプルを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || samples.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
        <div className="text-center p-6">
          <Palette size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-2">{error || "アートQRサンプルがまだありません"}</p>
          <p className="text-gray-500 text-sm mb-4">{error ? "エラーが発生しました" : "アートQRコードを生成すると、ここにサンプルが表示されます"}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={fetchSamples}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 text-sm"
            >
              <RefreshCw size={16} />
              再読み込み
            </button>
            {process.env.NODE_ENV === "development" && (
              <button
                onClick={() => window.open("/api/test-artistic-qr", "_blank")}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 text-sm"
              >
                DB確認
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentSample = samples[currentIndex];

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg overflow-hidden">
      {/* ヘッダー */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-r from-pink-600 to-purple-700 text-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm">アートQRサンプル</h3>
          </div>
          <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
            {currentIndex + 1} / {samples.length}
          </div>
        </div>
      </div>

      {/* 下部情報エリア - 透明背景 */}
      <div className="absolute bottom-0 left-0 right-0 z-20" style={{ height: "72px" }}>
        <div className="text-center p-2 h-full flex flex-col justify-center">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1 mx-4 mb-1">
            <p className="text-sm font-medium text-white truncate">{currentSample.original_prompt}</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs mb-1">
            <span className="bg-pink-500/90 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">{currentSample.style_type}スタイル</span>
          </div>

          {/* ドットインジケーター */}
          {samples.length > 1 && (
            <div className="flex justify-center gap-1">
              {samples.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 backdrop-blur-sm ${
                    index === currentIndex ? "bg-pink-500/90 w-4" : "bg-white/70 hover:bg-white/90"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* メイン画像エリア - 全画面表示 */}
      <div className="absolute inset-0 pt-12 pb-4">
        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="relative max-w-full max-h-full">
            <img
              src={currentSample.image_url}
              alt={`アートQR: ${currentSample.original_prompt}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />

            {/* 画像上のナビゲーションボタン */}
            {samples.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 再読み込みボタン */}
      <div className="absolute top-14 right-3 z-20">
        <button
          onClick={fetchSamples}
          className="bg-white/80 hover:bg-white text-gray-700 rounded-full p-1.5 shadow-sm transition-all duration-200"
          title="新しいサンプルを取得"
        >
          <RefreshCw size={14} />
        </button>
      </div>
    </div>
  );
}
