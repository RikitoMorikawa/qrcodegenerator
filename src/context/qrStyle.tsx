"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type DotsStyle = "rounded" | "dots" | "classy" | "classy-rounded" | "square" | "extra-rounded";
export type CornersStyle = "dot" | "square" | "extra-rounded";

export type StyleType = "normal" | "cute" | "cool" | "elegant" | "playful" | "retro";

export type QrStyleState = {
  text: string;
  size: number; // px
  margin: number; // px
  color: string;
  bgColor: string;
  dotsStyle: DotsStyle;
  cornersStyle: CornersStyle;
  logoDataUrl?: string; // data URL (uploaded or AI-generated)
  uploadedImageUrl?: string; // ユーザーがアップロードした画像のみ
  logoSizeRatio: number; // 0-1 relative to QR size
  hideBackgroundDots: boolean;
  // AI生成設定
  styleType: StyleType;
  aiPrompt: string; // AI生成のプロンプト入力値
  // UI状態
  isGeneratingAI: boolean; // AI生成中かどうか
};

const defaultState: QrStyleState = {
  text: "https://example.com",
  size: 512, // 高解像度のため大きめに設定
  margin: 0, // 背景色が全範囲に適用されるよう0に設定
  color: "#3B82F6", // 鮮やかな青色
  bgColor: "#ffffff",
  dotsStyle: "square", // 読み取り最適化で固定
  cornersStyle: "square", // 読み取り最適化で固定
  logoSizeRatio: 0.7, // 70%に少し縮小して読み取り性向上
  hideBackgroundDots: true, // 背景は隠してロゴ本体のみクリア
  // AI生成設定
  styleType: "normal", // デフォルトは未設定（普通）
  aiPrompt: "", // AI生成のプロンプト入力値
  // UI状態
  isGeneratingAI: false, // 初期状態は生成中ではない
};

type QrStyleContextValue = {
  state: QrStyleState;
  setState: React.Dispatch<React.SetStateAction<QrStyleState>>;
};

const QrStyleContext = createContext<QrStyleContextValue | null>(null);

export function useQrStyle(): QrStyleContextValue {
  const ctx = useContext(QrStyleContext);
  if (!ctx) throw new Error("useQrStyle must be used within QrStyleProvider");
  return ctx;
}

export function QrStyleProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<QrStyleState>(defaultState);
  const value = useMemo(() => ({ state, setState }), [state]);
  return <QrStyleContext.Provider value={value}>{children}</QrStyleContext.Provider>;
}
