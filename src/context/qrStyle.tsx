"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type DotsStyle = "rounded" | "dots" | "classy" | "classy-rounded" | "square" | "extra-rounded";
export type CornersStyle = "dot" | "square" | "extra-rounded";

export type QrStyleState = {
  text: string;
  size: number; // px
  margin: number; // px
  color: string;
  bgColor: string;
  dotsStyle: DotsStyle;
  cornersStyle: CornersStyle;
  logoDataUrl?: string; // data URL (uploaded or AI-generated)
  logoSizeRatio: number; // 0-1 relative to QR size
  hideBackgroundDots: boolean;
};

const defaultState: QrStyleState = {
  text: "https://example.com",
  size: 256,
  margin: 12,
  color: "#3B82F6", // 鮮やかな青色
  bgColor: "#ffffff",
  dotsStyle: "rounded",
  cornersStyle: "square",
  logoSizeRatio: 0.3, // QRコードと馴染むサイズに調整
  hideBackgroundDots: true, // ロゴ背景のドットを隠す
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
