"use client";

import React, { useEffect, useState } from "react";

type ArtisticQRItem = {
  id: string;
  image_url: string;
  prompt: string;
  qr_text: string;
  created_at: string;
};

export default function ArtisticQRGallery() {
  const [items, setItems] = useState<ArtisticQRItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-center bg-gradient-to-r from-pink-400 to-orange-600 bg-clip-text text-transparent">
          アートQRコードギャラリー
        </h2>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-center bg-gradient-to-r from-pink-400 to-orange-600 bg-clip-text text-transparent">
          アートQRコードギャラリー
        </h2>
        <div className="text-center text-gray-400 py-12">
          <p>まだアートQRコードがありません</p>
          <p className="text-sm mt-2">アートQRコードを生成すると、ここに表示されます</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold text-center bg-gradient-to-r from-pink-400 to-orange-600 bg-clip-text text-transparent">
        アートQRコードギャラリー
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.image_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square rounded-lg overflow-hidden border border-gray-700 hover:border-pink-400 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-400/20 cursor-pointer block"
          >
            <img src={item.image_url} alt={item.prompt} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between">
              <div className="flex justify-center items-center flex-1">
                <p className="text-white text-sm font-semibold">クリックで拡大</p>
              </div>
              <div className="p-3 text-white">
                <p className="text-xs font-semibold line-clamp-2 mb-1">{item.prompt}</p>
                <p className="text-xs text-gray-300 line-clamp-1">{item.qr_text}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
