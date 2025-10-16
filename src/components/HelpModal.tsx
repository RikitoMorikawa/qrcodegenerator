"use client";

import React from "react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">使い方ガイド</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">
              ×
            </button>
          </div>

          <div className="space-y-5">
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>簡単3ステップ</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="flex justify-center mb-2">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  </div>
                  <div className="font-semibold text-blue-800">URL入力</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <div className="flex justify-center mb-2">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  </div>
                  <div className="font-semibold text-purple-800">画像追加</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="flex justify-center mb-2">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  </div>
                  <div className="font-semibold text-green-800">ダウンロード</div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>画像の追加方法</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <h4 className="font-semibold text-blue-800">画像アップロード</h4>
                  </div>
                  <p className="text-blue-700 text-sm">PNG、JPEG等の画像ファイルをアップロード</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    <h4 className="font-semibold text-purple-800">AIロゴ生成</h4>
                  </div>
                  <p className="text-purple-700 text-sm">テキストでロゴを説明してAI生成</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <span>ポイント</span>
              </h3>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-yellow-800">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    画像は自動で最適サイズに調整
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    PNG/JPEG/WebP/SVG対応
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-8 text-center">
            <button onClick={onClose} className="btn btn-primary px-8">
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
