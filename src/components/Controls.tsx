"use client";

import React, { useTransition } from "react";
import { useQrStyle, type StyleType, type DotsStyle, type CornersStyle } from "@/context/qrStyle";
import { removeBackgroundAdvanced } from "@/utils/imageProcessing";

export default function Controls() {
  const { state, setState } = useQrStyle();

  const onChange = <K extends keyof typeof state>(key: K, value: (typeof state)[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  };

  const handleGeneratingChange = (isGenerating: boolean) => {
    setState((s) => ({ ...s, isGeneratingAI: isGenerating }));
  };

  return (
    <div className="grid gap-6">
      <div className="space-y-3">
        <label className="block text-sm font-medium">URL</label>
        <input
          className="input"
          value={state.text}
          onChange={(e) => onChange("text", e.target.value)}
          placeholder="https://..."
          disabled={state.isGeneratingAI}
        />
      </div>

      <div className="space-y-3">
        <ImageUploader isDisabled={state.isGeneratingAI} />
        <AIImageGenerator onGeneratingChange={handleGeneratingChange} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="block text-sm font-medium">QRコードの色</label>
          <input type="color" className="w-full h-10 rounded border" value={state.color} onChange={(e) => onChange("color", e.target.value)} />
          <div className="flex gap-1 flex-wrap">
            {["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"].map((color) => (
              <button
                key={color}
                className="w-7 h-7 sm:w-6 sm:h-6 rounded border-2 border-white shadow-sm"
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
                className="w-7 h-7 sm:w-6 sm:h-6 rounded border-2 border-gray-300 shadow-sm"
                style={{ backgroundColor: color }}
                onClick={() => onChange("bgColor", color)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

function AIImageGenerator({ onGeneratingChange }: { onGeneratingChange: (isGenerating: boolean) => void }) {
  const { state, setState } = useQrStyle();
  const [isPending, startTransition] = useTransition();
  const [progress, setProgress] = React.useState<string>("");
  const [showFullScreenProgress, setShowFullScreenProgress] = React.useState(false);
  const [progressPercent, setProgressPercent] = React.useState(0);
  const [isPublic, setIsPublic] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  const onChange = <K extends keyof typeof state>(key: K, value: (typeof state)[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  };

  const handleGenerate = async () => {
    const userPrompt = state.aiPrompt.trim();
    if (!userPrompt) return;

    // 生成開始を親に通知
    onGeneratingChange(true);

    // 即座に進捗表示を開始
    setShowFullScreenProgress(true);
    setProgressPercent(0);
    setProgress("AI画像を生成中...");

    startTransition(async () => {
      try {
        // プログレスバーを段階的に進める
        const updateProgress = (percent: number, message: string) => {
          setProgressPercent(percent);
          setProgress(message);
        };

        // レスポンス時間を測定してキャッシュヒットを検出
        const startTime = Date.now();
        const progressTimeouts: NodeJS.Timeout[] = [];

        // 初期進捗を段階的に進める（最初の5秒で20-30%まで）
        progressTimeouts.push(setTimeout(() => updateProgress(5, "AI画像を生成中..."), 100));
        progressTimeouts.push(setTimeout(() => updateProgress(12, "AI画像を生成中..."), 300));
        progressTimeouts.push(setTimeout(() => updateProgress(18, "AIサーバーに接続中..."), 600));
        progressTimeouts.push(setTimeout(() => updateProgress(25, "AIサーバーに接続中..."), 1000));
        progressTimeouts.push(setTimeout(() => updateProgress(30, "AI画像を生成中..."), 1500));

        // プロンプトに設定を追加
        const styleModifier = generateStyleModifier(state.styleType);
        const fullPrompt = styleModifier ? `${userPrompt}, ${styleModifier}` : userPrompt;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒タイムアウト

        // 5秒後に次の段階へ進む
        progressTimeouts.push(
          setTimeout(() => {
            updateProgress(35, "高品質画像を生成中...");
          }, 5000)
        );

        const res = await fetch("/api/ai-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: fullPrompt }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        const isCacheHit = responseTime < 2000; // 2秒以内はキャッシュヒットと判定

        if (!res.ok) {
          const err = await safeJson(res);
          throw new Error(err?.error || res.statusText);
        }

        // キャッシュヒットの場合は進行中のタイムアウトをクリア
        if (isCacheHit) {
          progressTimeouts.forEach((timeout) => clearTimeout(timeout));
          updateProgress(80, "キャッシュから取得中...");
          await new Promise((resolve) => setTimeout(resolve, 200));
        } else {
          // API完了後の段階的進捗（新規生成の場合）
          updateProgress(50, "画像を受信中...");
          await new Promise((resolve) => setTimeout(resolve, 400));
        }

        updateProgress(isCacheHit ? 85 : 60, "画像を処理中...");
        const json = (await res.json()) as { dataUrl: string; fromCache?: boolean };

        // APIからのキャッシュ情報も考慮
        const isActualCacheHit = isCacheHit || json.fromCache;

        await new Promise((resolve) => setTimeout(resolve, isActualCacheHit ? 200 : 500));
        updateProgress(isActualCacheHit ? 90 : 70, "背景を透明化中...");

        await new Promise((resolve) => setTimeout(resolve, isActualCacheHit ? 200 : 400));
        updateProgress(isActualCacheHit ? 95 : 80, "背景を透明化中...");

        // 背景除去処理を適用
        const processedDataUrl = await removeBackgroundAdvanced(json.dataUrl);

        updateProgress(isActualCacheHit ? 98 : 90, "最終調整中...");
        await new Promise((resolve) => setTimeout(resolve, isActualCacheHit ? 200 : 400));

        updateProgress(isActualCacheHit ? 99 : 95, "最終調整中...");
        setState((s) => ({
          ...s,
          logoDataUrl: processedDataUrl,
          uploadedImageUrl: undefined, // AI生成時はアップロード画像をクリア
        }));

        // 画像を自動保存（キャッシュからの場合はスキップ）
        if (processedDataUrl && !isActualCacheHit) {
          try {
            console.log("Saving image to Supabase...", { fullPrompt, originalPrompt: userPrompt, styleType: state.styleType, isPublic });
            const result = await saveImageToSupabase(processedDataUrl, fullPrompt, userPrompt, state.styleType, isPublic);
            console.log("Image saved successfully:", result);
          } catch (saveError) {
            console.error("Failed to save image:", saveError);
            // 保存エラーは表示しないが、ログに記録
          }
        } else if (isActualCacheHit) {
          console.log("Skipping image save for cached result");
        }

        await new Promise((resolve) => setTimeout(resolve, isActualCacheHit ? 100 : 300));
        updateProgress(100, isActualCacheHit ? "キャッシュから完了！" : "完了！");

        // 100%表示を少し見せてから非表示（キャッシュヒット時は短縮）
        setTimeout(
          () => {
            setProgress("");
            setShowFullScreenProgress(false);
            setProgressPercent(0);
            onGeneratingChange(false); // 生成完了を親に通知
          },
          isActualCacheHit ? 800 : 1500
        );
      } catch (error: unknown) {
        setProgress("");
        setShowFullScreenProgress(false);
        setProgressPercent(0);
        onGeneratingChange(false); // エラー時も生成終了を親に通知
        const err = error as Error;
        if (err.name === "AbortError") {
          alert("生成がタイムアウトしました。もう一度お試しください。");
        } else {
          alert(`AI生成に失敗しました: ${err.message || "不明なエラー"}`);
        }
      }
    });
  };

  const saveImageToSupabase = async (imageDataUrl: string, fullPrompt: string, originalPrompt: string, styleType: string, isPublic: boolean) => {
    const response = await fetch("/api/save-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: fullPrompt,
        originalPrompt,
        styleType,
        imageDataUrl,
        isPublic,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save image");
    }

    return response.json();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleGenerate();
      }}
      className="space-y-3"
    >
      <label className="block text-sm font-medium">AIロゴ生成</label>

      <div className="grid grid-cols-2 gap-3">
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

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-600">公開設定</label>
          <select
            className="input text-sm"
            value={isPublic ? "public" : "private"}
            onChange={(e) => setIsPublic(e.target.value === "public")}
            disabled={isPending}
          >
            <option value="public">公開</option>
            <option value="private">非公開</option>
          </select>
        </div>
      </div>

      <input
        name="prompt"
        className="input"
        placeholder="例: 宇宙飛行士の犬、忍者の猫、魔法使いのうさぎ..."
        value={state.aiPrompt}
        onChange={(e) => onChange("aiPrompt", e.target.value)}
        disabled={isPending}
      />

      {/* Card内ローディング表示 */}
      {showFullScreenProgress && (
        <div className="mt-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-lg p-6 text-white relative overflow-hidden">
          {/* アニメーション背景パーティクル */}
          <div className="absolute inset-0">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white opacity-10 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 3 + 1}px`,
                  height: `${Math.random() * 3 + 1}px`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${Math.random() * 2 + 2}s`,
                }}
              />
            ))}
          </div>

          {/* グラデーション波形 */}
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-y-12"
              style={{
                background: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
                animation: "wave 4s ease-in-out infinite",
              }}
            />
          </div>

          {/* メインコンテンツ */}
          <div className="relative text-center">
            <div className="mb-6">
              <div className="relative inline-block">
                {/* 外側の回転リング */}
                <div
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 border-r-purple-400 animate-spin"
                  style={{ width: "60px", height: "60px", left: "-6px", top: "-6px" }}
                />

                {/* メインスピナー */}
                <svg className="animate-spin h-12 w-12 text-blue-300 mx-auto" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>

                {/* 中央アイコン */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="h-6 w-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            <h3 className="text-xl font-bold text-white mb-2">AI画像生成中</h3>
            <p className="text-blue-200 font-semibold mb-4">{progress}</p>

            {/* プログレスバー */}
            <div className="relative mb-4">
              <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full h-3 transition-all duration-700 ease-out relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  {/* プログレスバーの光沢効果 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
                </div>
              </div>
              <div className="text-right mt-1">
                <span className="text-xs font-semibold text-blue-200">{progressPercent}%</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-white text-sm font-medium">高品質なロゴを生成しています</p>
              <p className="text-blue-200 text-xs">数秒〜30秒程度お待ちください</p>
              <div className="flex items-center justify-center gap-1 mt-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
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
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            AIロゴを生成
          </span>
        )}
      </button>
    </form>
  );
}

function ImageUploader({ isDisabled }: { isDisabled: boolean }) {
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
          <div
            className={`flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 ${isDisabled ? "opacity-50" : ""}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={state.uploadedImageUrl} alt="アップロード画像" className="max-w-20 max-h-20 object-contain" />
          </div>
          <button
            type="button"
            onClick={handleRemoveImage}
            className={`btn w-full ${
              isDisabled ? "bg-gray-600 text-gray-400 cursor-not-allowed border-gray-600" : "text-red-600 border-red-300 hover:bg-red-50"
            }`}
            disabled={isDisabled}
          >
            画像を削除
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" disabled={isDisabled} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`btn w-full ${isDisabled ? "bg-gray-600 text-gray-400 cursor-not-allowed" : "btn-primary hover:bg-blue-700"}`}
            disabled={isDisabled}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              画像を選択
            </span>
          </button>
          <p className={`text-xs text-gray-500 text-center ${isDisabled ? "opacity-50" : ""}`}>PNG、JPEG、WebP等の画像ファイルに対応</p>
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
