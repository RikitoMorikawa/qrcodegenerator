"use client";

import React, { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ArtisticQRItem = {
  id: string;
  image_url: string;
  prompt: string;
  qr_text: string;
  style_type: string;
  created_at: string;
};

// スタイルタイプの日本語マッピング
const styleTypeLabels: Record<string, string> = {
  normal: "スタンダード",
  cute: "可愛い",
  cool: "カッコイイ",
  elegant: "オシャレ",
  playful: "元気",
  retro: "レトロ",
};

export default function ArtisticQRGallery() {
  const [items, setItems] = useState<ArtisticQRItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchGallery = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/artistic-qr-gallery");
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch artistic QR gallery:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();

    // カスタムイベントでギャラリーを更新
    const handleUpdate = () => {
      setTimeout(() => fetchGallery(), 500);
    };

    window.addEventListener("artistic-qr-saved", handleUpdate);
    return () => window.removeEventListener("artistic-qr-saved", handleUpdate);
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-400 to-orange-600 bg-clip-text text-transparent">公開されたアートQRコード</h2>
          <p className="text-sm text-gray-400">アートQRコードギャラリー</p>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-400 to-orange-600 bg-clip-text text-transparent">公開されたアートQRコード</h2>
          <p className="text-sm text-gray-400">アートQRコードギャラリー</p>
        </div>
        <div className="text-center text-gray-400 py-12">
          <p>まだ公開されたアートQRコードがありません</p>
          <p className="text-sm mt-2">アートQRコードを生成して公開すると、ここに表示されます</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-400 to-orange-600 bg-clip-text text-transparent">公開されたアートQRコード</h2>
        <p className="text-sm text-gray-400">アートQRコードギャラリー（{items.length}件）</p>
      </div>

      <div className="relative">
        {/* スライドナビゲーションボタン */}
        {items.length > 3 && (
          <>
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
              aria-label="前へ"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
              aria-label="次へ"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* 横スライドギャラリー */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {items.map((item) => (
            <a
              key={item.id}
              href={item.image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex-shrink-0 w-48 sm:w-56 aspect-square rounded-lg overflow-hidden border border-gray-700 hover:border-pink-400 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-400/20 cursor-pointer block"
            >
              <img src={item.image_url} alt={item.prompt} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between">
                <div className="flex justify-center items-center flex-1">
                  <div className="text-center">
                    <p className="text-white text-sm font-semibold mb-1">クリックで拡大</p>
                    <div className="w-8 h-8 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-3 text-white space-y-1.5">
                  <p className="text-sm font-semibold line-clamp-2">{item.prompt}</p>
                  <p className="text-xs text-gray-300 line-clamp-1">{item.qr_text}</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-pink-500/80 to-orange-500/80 text-white">
                      {styleTypeLabels[item.style_type] || item.style_type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-0.5">
                    <span>公開済み</span>
                    <span>{new Date(item.created_at).toLocaleDateString("ja-JP")}</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* スクロールヒント */}
      {items.length > 3 && (
        <div className="text-center">
          <p className="text-xs text-gray-500">← スワイプまたはボタンでスライド →</p>
        </div>
      )}
    </div>
  );
}
