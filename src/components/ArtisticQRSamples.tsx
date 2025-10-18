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
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 rounded-lg border border-gray-700/50 shadow-2xl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-600 border-t-pink-500 rounded-full animate-spin mb-4 mx-auto shadow-lg"></div>
          <p className="text-gray-200 font-medium">アートQRサンプルを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || samples.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 rounded-lg border border-gray-700/50 shadow-2xl">
        <div className="text-center p-6">
          <Palette size={48} className="text-gray-500 mx-auto mb-4" />
          <p className="text-gray-200 font-medium mb-2">{error || "アートQRサンプルがまだありません"}</p>
          <p className="text-gray-400 text-sm mb-4">{error ? "エラーが発生しました" : "アートQRコードを生成すると、ここにサンプルが表示されます"}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => fetchSamples(true)}
              disabled={isFetching}
              className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 text-white rounded-lg transition-all duration-300 text-sm border border-pink-500/30 shadow-lg backdrop-blur-sm ${
                isFetching ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
              }`}
            >
              <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
              {isFetching ? "読み込み中..." : "再読み込み"}
            </button>
            {process.env.NODE_ENV === "development" && (
              <button
                onClick={() => window.open("/api/test-artistic-qr", "_blank")}
                className="px-4 py-2 bg-gradient-to-r from-gray-700 to-slate-600 hover:from-gray-600 hover:to-slate-500 text-gray-200 rounded-lg transition-all duration-300 text-sm border border-gray-600/50 shadow-lg backdrop-blur-sm hover:scale-105"
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
    <div className="w-full h-full relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 rounded-lg overflow-hidden border border-gray-700/50 shadow-2xl">
      {/* ヘッダー */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-r from-gray-800/95 via-slate-700/95 to-gray-800/95 backdrop-blur-md border-b border-gray-600/30 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-pulse"></div>
            <h3 className="font-bold text-sm text-gray-100">アートQRサンプル</h3>
          </div>
          <div className="text-xs bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-200 px-3 py-1 rounded-full border border-pink-400/20 backdrop-blur-sm">
            {currentIndex + 1} / {samples.length}
          </div>
        </div>
      </div>

      {/* 下部ドットインジケーターのみ */}
      <div className="absolute bottom-4 left-0 right-0 z-20">
        {samples.length > 1 && (
          <div className="flex justify-center gap-2">
            {samples.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`rounded-full transition-all duration-300 backdrop-blur-sm border shadow-sm ${
                  index === currentIndex
                    ? "w-6 h-2 bg-gradient-to-r from-pink-500 to-purple-600 border-pink-400/50"
                    : "w-2 h-2 bg-gray-600/70 border-gray-500/50 hover:bg-gray-500/80 hover:border-gray-400/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* メイン画像エリア - 中央配置でリッチなデザイン */}
      <div className="absolute inset-0 pt-16 pb-12">
        <div className="w-full h-full flex items-center justify-center p-6">
          <div className="relative w-full h-full max-w-md max-h-md">
            {/* 画像読み込み中のローディング */}
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800/90 backdrop-blur-sm rounded-xl z-10 border border-gray-600/30">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">読み込み中...</span>
                </div>
              </div>
            )}

            <div className="relative w-full h-full bg-gradient-to-br from-gray-800/50 to-slate-700/50 rounded-xl p-3 border border-gray-600/30 shadow-2xl backdrop-blur-sm">
              <img
                key={currentSample.id}
                src={currentSample.image_url}
                alt={`アートQR: ${currentSample.original_prompt}`}
                className={`w-full h-full object-contain rounded-lg shadow-xl transition-all duration-500 ${
                  imageLoading ? "opacity-0 scale-95" : "opacity-100 scale-100"
                }`}
                onLoad={() => handleImageLoad(currentSample.image_url)}
                onError={handleImageError}
              />

              {/* QRコード上のオーバーレイ情報 - 左下配置でQRを読み取れないようにする */}
              <div className="absolute bottom-4 left-4 pointer-events-none">
                <div className="bg-black/85 backdrop-blur-md rounded-xl px-4 py-3 border border-gray-600/50 shadow-2xl max-w-xs">
                  <div className="space-y-2">
                    <div className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 rounded-lg px-3 py-1.5 border border-pink-400/30">
                      <p className="text-xs font-medium text-gray-100 truncate">{currentSample.original_prompt}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium border border-pink-400/30 shadow-lg">
                        {currentSample.style_type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 画像上のナビゲーションボタン - リッチなデザイン */}
            {samples.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-gradient-to-r from-gray-800/90 to-slate-700/90 hover:from-gray-700/95 hover:to-slate-600/95 text-gray-100 rounded-full p-3 transition-all duration-300 z-20 border border-gray-600/50 shadow-xl backdrop-blur-sm hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={imageLoading}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-gradient-to-r from-gray-800/90 to-slate-700/90 hover:from-gray-700/95 hover:to-slate-600/95 text-gray-100 rounded-full p-3 transition-all duration-300 z-20 border border-gray-600/50 shadow-xl backdrop-blur-sm hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={imageLoading}
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 再読み込みボタン - リッチなデザイン */}
      <div className="absolute top-16 right-4 z-20">
        <button
          onClick={() => fetchSamples(true)}
          disabled={isFetching}
          className={`bg-gradient-to-r from-gray-800/90 to-slate-700/90 hover:from-gray-700/95 hover:to-slate-600/95 text-gray-100 rounded-full p-2 shadow-xl transition-all duration-300 border border-gray-600/50 backdrop-blur-sm hover:scale-110 ${
            isFetching ? "opacity-50 cursor-not-allowed hover:scale-100" : ""
          }`}
          title="新しいサンプルを取得"
        >
          <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
        </button>
      </div>
    </div>
  );
}
