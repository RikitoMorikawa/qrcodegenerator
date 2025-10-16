"use client";

import React, { useTransition } from "react";
import { useQrStyle, type StyleType, type DotsStyle, type CornersStyle } from "@/context/qrStyle";
import { removeBackgroundAdvanced } from "@/utils/imageProcessing";

export default function Controls() {
  const { state, setState } = useQrStyle();

  const onChange = <K extends keyof typeof state>(key: K, value: (typeof state)[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  };

  return (
    <div className="grid gap-6">
      <div className="space-y-3">
        <label className="block text-sm font-medium">URL</label>
        <input className="input" value={state.text} onChange={(e) => onChange("text", e.target.value)} placeholder="https://..." />
      </div>

      <div className="space-y-3">
        <ImageUploader />
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="block text-sm font-medium">ドットスタイル</label>
          <select className="input" value={state.dotsStyle} onChange={(e) => onChange("dotsStyle", e.target.value as DotsStyle)}>
            <option value="square">四角</option>
            <option value="rounded">丸角</option>
            <option value="dots">ドット</option>
            <option value="classy">クラシック</option>
            <option value="classy-rounded">クラシック丸角</option>
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
    </div>
  );
}

// プロンプト生成のヘルパー関数
function generateStyleModifier(styleType: StyleType): string {
  const styleModifiers = {
    normal: "", // 未設定（普通）は何も追加しない
    cute: "kawaii, cute style, adorable, soft features, pastel colors",
    cool: "cool design, sleek, confident, bold colors, modern style",
    elegant: "elegant design, sophisticated, refined, graceful, classy",
    playful: "playful style, fun, energetic, vibrant colors, cheerful",
    retro: "retro style, vintage design, nostalgic, classic colors",
  };

  return styleModifiers[styleType];
}

function AIImageGenerator() {
  const { state, setState } = useQrStyle();
  const [isPending, startTransition] = useTransition();
  const [progress, setProgress] = React.useState<string>("");
  const [showFullScreenProgress, setShowFullScreenProgress] = React.useState(false);
  const [progressPercent, setProgressPercent] = React.useState(0);

  const onChange = <K extends keyof typeof state>(key: K, value: (typeof state)[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  };

  const handleGenerate = async () => {
    const userPrompt = state.aiPrompt.trim();
    if (!userPrompt) return;

    // 即座に進捗表示を開始
    setShowFullScreenProgress(true);
    setProgressPercent(0);
    setProgress("🎨 AI画像を生成中...");

    startTransition(async () => {
      try {
        // プログレスバーを段階的に進める
        const updateProgress = (percent: number, message: string) => {
          setProgressPercent(percent);
          setProgress(message);
        };

        updateProgress(10, "🎨 AI画像を生成中...");

        // プロンプトに設定を追加
        const styleModifier = generateStyleModifier(state.styleType);
        const fullPrompt = styleModifier ? `${userPrompt}, ${styleModifier}` : userPrompt;

        updateProgress(20, "📡 AIサーバーに接続中...");

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒タイムアウト

        updateProgress(30, "🤖 AI画像を生成中...");

        const res = await fetch("/api/ai-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: fullPrompt }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const err = await safeJson(res);
          throw new Error(err?.error || res.statusText);
        }

        updateProgress(60, "🖼️ 画像を処理中...");
        const json = (await res.json()) as { dataUrl: string };

        updateProgress(80, "🎨 背景を透明化中...");
        // 背景除去処理を適用
        const processedDataUrl = await removeBackgroundAdvanced(json.dataUrl);

        updateProgress(95, "✨ 最終調整中...");
        setState((s) => ({
          ...s,
          logoDataUrl: processedDataUrl,
          uploadedImageUrl: undefined, // AI生成時はアップロード画像をクリア
        }));

        updateProgress(100, "✅ 完了！");

        // 100%表示を少し見せてから非表示
        setTimeout(() => {
          setProgress("");
          setShowFullScreenProgress(false);
          setProgressPercent(0);
        }, 1500);
      } catch (error: unknown) {
        setProgress("");
        setShowFullScreenProgress(false);
        setProgressPercent(0);
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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleGenerate();
      }}
      className="space-y-3"
    >
      <label className="block text-sm font-medium">AIロゴ生成（OpenAI）</label>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-600">スタイル</label>
        <select className="input text-sm" value={state.styleType} onChange={(e) => onChange("styleType", e.target.value as StyleType)} disabled={isPending}>
          <option value="normal">未設定</option>
          <option value="cute">可愛い</option>
          <option value="cool">カッコイイ</option>
          <option value="elegant">オシャレ</option>
          <option value="playful">元気</option>
          <option value="retro">レトロ</option>
        </select>
      </div>

      <input
        name="prompt"
        className="input"
        placeholder="例: 宇宙飛行士の犬、忍者の猫、魔法使いのうさぎ..."
        value={state.aiPrompt}
        onChange={(e) => onChange("aiPrompt", e.target.value)}
        disabled={isPending}
      />

      {progress && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg">{progress}</div>
              <div className="text-blue-100 text-sm mt-1">しばらくお待ちください...</div>
            </div>
          </div>
          <div className="mt-3 bg-white bg-opacity-20 rounded-full h-2">
            <div className="bg-white rounded-full h-2 transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      )}

      {/* Full Screen Progress Overlay */}
      {showFullScreenProgress && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
            <div className="mb-6">
              <div className="relative inline-block">
                <svg className="animate-spin h-16 w-16 text-blue-600 mx-auto" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">AI画像生成中</h3>
            <p className="text-lg text-blue-600 font-semibold mb-4">{progress}</p>
            <div className="bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full h-3 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-gray-600 text-sm">
              高品質なロゴを生成しています
              <br />
              数秒〜30秒程度お待ちください
            </p>
          </div>
        </div>
      )}

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

function ImageUploader() {
  const { state, setState } = useQrStyle();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 画像ファイルかチェック
    if (!file.type.startsWith("image/")) {
      alert("画像ファイルを選択してください");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      // 添付画像をロゴサイズに合わせてリサイズ
      resizeImageForLogo(dataUrl).then((resizedDataUrl) => {
        setState((s) => ({
          ...s,
          logoDataUrl: resizedDataUrl,
          uploadedImageUrl: dataUrl, // 元画像をアップロード画像として記録
        }));
      });
    };
    reader.readAsDataURL(file);
  };

  // 添付画像をロゴエリアに適したサイズにリサイズする関数
  const resizeImageForLogo = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        // ロゴエリアのサイズ（QRコードの70%エリア内で画像を50%に）
        const logoAreaSize = 512 * 0.7; // QRコードサイズの70%
        const imageSize = logoAreaSize * 0.8; // その中で画像を80%に

        canvas.width = logoAreaSize;
        canvas.height = logoAreaSize;

        // 背景を透明に
        ctx.clearRect(0, 0, logoAreaSize, logoAreaSize);

        // 画像のアスペクト比を保持してリサイズ
        const scale = Math.min(imageSize / img.width, imageSize / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // 中央に配置
        const x = (logoAreaSize - scaledWidth) / 2;
        const y = (logoAreaSize - scaledHeight) / 2;

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        resolve(canvas.toDataURL("image/png"));
      };
      img.src = dataUrl;
    });
  };

  const handleRemoveImage = () => {
    setState((s) => ({
      ...s,
      logoDataUrl: undefined,
      uploadedImageUrl: undefined,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">画像アップロード</label>

      {state.uploadedImageUrl ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={state.uploadedImageUrl} alt="アップロード画像" className="max-w-20 max-h-20 object-contain" />
          </div>
          <button type="button" onClick={handleRemoveImage} className="btn w-full text-red-600 border-red-300 hover:bg-red-50">
            画像を削除
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-primary w-full">
            📁 画像を選択
          </button>
          <p className="text-xs text-gray-500 text-center">PNG、JPEG、WebP等の画像ファイルに対応</p>
        </div>
      )}
    </div>
  );
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
