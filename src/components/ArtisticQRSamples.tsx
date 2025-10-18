"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const [imageLoading, setImageLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isFetching, setIsFetching] = useState(false); // 重複実行防止用
  const [hasInitialized, setHasInitialized] = useState(false); // 初期化フラグ
  const initRef = useRef(false); // useRefでも初期化を管理

  useEffect(() => {
    // useRefとstateの両方でチェック
    if (initRef.current || hasInitialized) {
      console.log("Already initialized, skipping fetchSamples");
      return;
    }

    let isMounted = true;

    const loadSamples = async () => {
      if (isMounted && !initRef.current && !hasInitialized) {
        console.log("Initializing ArtisticQRSamples...");
        initRef.current = true;
        setHasInitialized(true);
        await fetchSamples();
      }
    };

    loadSamples();

    return () => {
      isMounted = false;
    };
  }, []); // 依存関係を空配列に戻す

  // 画像のプリロード - loadedImagesを依存関係から除外
  useEffect(() => {
    if (samples.length > 0) {
      samples.forEach((sample) => {
        const img = new Image();
        img.onload = () => {
          setLoadedImages((prev) => new Set([...prev, sample.image_url]));
        };
        img.onerror = () => {
          console.error("Failed to preload image:", sample.image_url);
        };
        img.src = sample.image_url;
      });
    }
  }, [samples]); // loadedImagesを依存関係から除外

  const fetchSamples = async (isManualRefresh = false) => {
    // 既に実行中の場合は重複実行を防ぐ
    if (isFetching) {
      console.log("fetchSamples already in progress, skipping...");
      return;
    }

    try {
      setIsFetching(true);
      setIsLoading(true);
      setError(null);

      const timestamp = Date.now();
      console.log(`[${timestamp}] Fetching artistic QR samples... (manual: ${isManualRefresh})`);

      const response = await fetch("/api/artistic-qr-samples");
      const data = await response.json();

      console.log(`[${timestamp}] API response:`, { status: response.status, samplesCount: data.samples?.length || 0 });

      if (response.ok) {
        setSamples(data.samples || []);
        setCurrentIndex(0);
        setLoadedImages(new Set()); // 新しいサンプル取得時にリセット
        if (data.samples && data.samples.length > 0) {
          setImageLoading(true); // 最初の画像の読み込み開始
        }
        console.log(`[${timestamp}] Successfully loaded ${data.samples?.length || 0} samples`);
      } else {
        const errorMsg = data.details ? `${data.error}: ${data.details}` : data.error || "サンプルの取得に失敗しました";
        setError(errorMsg);
        console.error(`[${timestamp}] API error:`, errorMsg);
      }
    } catch (err) {
      const errorMsg = "ネットワークエラーが発生しました";
      setError(errorMsg);
      console.error(`[${Date.now()}] Network error:`, err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  const nextSlide = () => {
    const nextIndex = (currentIndex + 1) % samples.length;
    if (!loadedImages.has(samples[nextIndex].image_url)) {
      setImageLoading(true);
    }
    setCurrentIndex(nextIndex);
  };

  const prevSlide = () => {
    const prevIndex = (currentIndex - 1 + samples.length) % samples.length;
    if (!loadedImages.has(samples[prevIndex].image_url)) {
      setImageLoading(true);
    }
    setCurrentIndex(prevIndex);
  };

  const goToSlide = (index: number) => {
    if (!loadedImages.has(samples[index].image_url)) {
      setImageLoading(true);
    }
    setCurrentIndex(index);
  };

  const handleImageLoad = (imageUrl: string) => {
    setLoadedImages((prev) => new Set([...prev, imageUrl]));
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
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
              onClick={() => fetchSamples(true)}
              disabled={isFetching}
              className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 text-sm ${
                isFetching ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
              {isFetching ? "読み込み中..." : "再読み込み"}
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
            {/* 画像読み込み中のローディング */}
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 rounded-lg z-10">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">読み込み中...</span>
                </div>
              </div>
            )}

            <img
              key={currentSample.id} // キーを追加してReactに新しい画像として認識させる
              src={currentSample.image_url}
              alt={`アートQR: ${currentSample.original_prompt}`}
              className={`max-w-full max-h-full object-contain rounded-lg shadow-lg transition-opacity duration-300 ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => handleImageLoad(currentSample.image_url)}
              onError={handleImageError}
            />

            {/* 画像上のナビゲーションボタン */}
            {samples.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 z-20"
                  disabled={imageLoading}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 z-20"
                  disabled={imageLoading}
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
          onClick={() => fetchSamples(true)}
          disabled={isFetching}
          className={`bg-white/80 hover:bg-white text-gray-700 rounded-full p-1.5 shadow-sm transition-all duration-200 ${
            isFetching ? "opacity-50 cursor-not-allowed" : ""
          }`}
          title="新しいサンプルを取得"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
        </button>
      </div>
    </div>
  );
}
