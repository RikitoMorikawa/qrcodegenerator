"use client";

import React, { useTransition } from "react";
import { useQrStyle, type DotsStyle, type CornersStyle } from "@/context/qrStyle";

export default function Controls() {
  const { state, setState } = useQrStyle();
  const [, startTransition] = useTransition();

  const onChange = <K extends keyof typeof state>(key: K, value: (typeof state)[K]) => {
    startTransition(() => setState((s) => ({ ...s, [key]: value })));
  };

  return (
    <div className="grid gap-6">
      <div className="space-y-3">
        <label className="block text-sm font-medium">URL</label>
        <input className="input" value={state.text} onChange={(e) => onChange("text", e.target.value)} placeholder="https://..." />
      </div>

      <div className="space-y-3">
        <AIImageGenerator />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="block text-sm font-medium">QRコードの色</label>
          <input type="color" className="w-full h-10 rounded border" value={state.color} onChange={(e) => onChange("color", e.target.value)} />
          <div className="flex gap-1 flex-wrap">
            {["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"].map((color) => (
              <button
                key={color}
                className="w-6 h-6 rounded border-2 border-white shadow-sm"
                style={{ backgroundColor: color }}
                onClick={() => onChange("color", color)}
              />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <label className="block text-sm font-medium">背景色</label>
          <input type="color" className="w-full h-10 rounded border" value={state.bgColor} onChange={(e) => onChange("bgColor", e.target.value)} />
          <div className="flex gap-1 flex-wrap">
            {["#FFFFFF", "#F3F4F6", "#FEF3C7", "#DBEAFE", "#D1FAE5", "#FCE7F3"].map((color) => (
              <button
                key={color}
                className="w-6 h-6 rounded border-2 border-gray-300 shadow-sm"
                style={{ backgroundColor: color }}
                onClick={() => onChange("bgColor", color)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium">ロゴサイズ: {Math.round(state.logoSizeRatio * 100)}%</label>
        <input
          type="range"
          min="0.2"
          max="0.7"
          step="0.05"
          className="w-full"
          value={state.logoSizeRatio}
          onChange={(e) => onChange("logoSizeRatio", parseFloat(e.target.value))}
        />
        <div className="text-xs text-gray-500">QRコードサイズ: 512px (高解像度固定)</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="block text-sm font-medium">ドットスタイル</label>
          <select className="input" value={state.dotsStyle} onChange={(e) => onChange("dotsStyle", e.target.value as DotsStyle)}>
            <option value="rounded">丸角</option>
            <option value="dots">ドット</option>
            <option value="classy">クラシック</option>
            <option value="classy-rounded">クラシック丸角</option>
            <option value="square">四角</option>
            <option value="extra-rounded">超丸角</option>
          </select>
        </div>
        <div className="space-y-3">
          <label className="block text-sm font-medium">コーナースタイル</label>
          <select className="input" value={state.cornersStyle} onChange={(e) => onChange("cornersStyle", e.target.value as CornersStyle)}>
            <option value="square">四角</option>
            <option value="dot">ドット</option>
            <option value="extra-rounded">丸角</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">💡 ヒント: ロゴは透明背景で生成すると、QRコードと自然に馴染みます</div>
      </div>
    </div>
  );
}

function AIImageGenerator() {
  const { setState } = useQrStyle();
  const [isPending, startTransition] = useTransition();
  const [progress, setProgress] = React.useState<string>("");

  const handleGenerate = async (formData: FormData) => {
    const prompt = String(formData.get("prompt") || "").trim();
    if (!prompt) return;

    startTransition(async () => {
      try {
        setProgress("🎨 AI画像を生成中...");

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒タイムアウト

        const res = await fetch("/api/ai-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const err = await safeJson(res);
          throw new Error(err?.error || res.statusText);
        }

        setProgress("🖼️ 画像を処理中...");
        const json = (await res.json()) as { dataUrl: string };

        setProgress("✅ 完了！");
        setState((s) => ({ ...s, logoDataUrl: json.dataUrl }));

        // 成功メッセージを少し表示してからクリア
        setTimeout(() => setProgress(""), 2000);
      } catch (error: unknown) {
        setProgress("");
        const err = error as Error;
        if (err.name === "AbortError") {
          alert("生成がタイムアウトしました。もう一度お試しください。");
        } else {
          alert(`AI生成に失敗しました: ${err.message || "不明なエラー"}`);
        }
      }
    });
  };

  return (
    <form action={handleGenerate} className="space-y-3">
      <label className="block text-sm font-medium">AIロゴ生成（OpenAI）</label>
      <input name="prompt" className="input" placeholder="例: 丸くて可愛い猫の探偵、大きな目、ふわふわ" disabled={isPending} />

      {progress && <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">{progress}</div>}

      <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            生成中...
          </span>
        ) : (
          "🎨 AIロゴを生成"
        )}
      </button>
    </form>
  );
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
