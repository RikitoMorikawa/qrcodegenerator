"use client";

import React, { useTransition } from "react";
import { useQrStyle, type StyleType, type DotsStyle, type CornersStyle, type GenerationType } from "@/context/qrStyle";
import { removeBackgroundAdvanced } from "@/utils/imageProcessing";

export default function Controls() {
  const { state, setState } = useQrStyle();
  const [activeTab, setActiveTab] = React.useState<"ai" | "upload">("ai");

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

      {/* タブナビゲーション */}
      <div className="space-y-3">
        <div className="flex gap-2 border-b border-gray-700">
          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            disabled={state.isGeneratingAI}
            className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
              activeTab === "ai"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-gray-400 hover:text-gray-300"
            } ${state.isGeneratingAI ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              AI生成
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            disabled={state.isGeneratingAI}
            className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
              activeTab === "upload"
                ? "border-purple-400 text-purple-400"
                : "border-transparent text-gray-400 hover:text-gray-300"
            } ${state.isGeneratingAI ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              画像アップロード
            </div>
          </button>
        </div>

        {/* タブコンテンツ */}
        {activeTab === "ai" ? (
          <div className="space-y-3">
            <GenerationTypeSelector />
            {state.generationType === "logo" ? (
              <AIImageGenerator onGeneratingChange={handleGeneratingChange} />
            ) : (
              <ArtisticQRGenerator onGeneratingChange={handleGeneratingChange} />
            )}
          </div>
        ) : (
          <ImageUploader isDisabled={state.isGeneratingAI} />
        )}
      </div>

      {/* QRコードカスタマイズオプション（アートQR生成時は非表示） */}
      {state.generationType !== "artistic" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="block text-sm font-medium">QRコードの色</label>
              <input type="color" className="w-full h-10 rounded border" value={state.color} onChange={(e) => onChange("color", e.target.value)} />
              <div className="flex gap-1 flex-wrap">
                {["#000000", "#FFFFFF", "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"].map((color) => (
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
                {["#000000", "#FFFFFF", "#F3F4F6", "#FEF3C7", "#DBEAFE", "#D1FAE5", "#FCE7F3", "#E0F2FE", "#FFF7ED"].map((color) => (
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
        </>
      )}
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
  const [isPublic, setIsPublic] = React.useState(true);

  const onChange = <K extends keyof typeof state>(key: K, value: (typeof state)[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  };

  const handleGenerate = async () => {
    const userPrompt = state.aiPrompt.trim();
    if (!userPrompt) return;

    // 生成開始を親に通知
    onGeneratingChange(true);

    // 即座に進捗表示を開始
    setState((s) => ({
      ...s,
      generationProgress: "AI画像を生成中...",
      generationPercent: 0,
    }));

    startTransition(async () => {
      try {
        // プログレスバーを段階的に進める
        const updateProgress = (percent: number, message: string) => {
          setState((s) => ({
            ...s,
            generationProgress: message,
            generationPercent: percent,
          }));
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
            const result = await saveImageToSupabase(processedDataUrl, fullPrompt, userPrompt, state.styleType, isPublic);

            // 画像保存成功時にギャラリー更新イベントを発火（少し遅延させてDB反映を確実にする）
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent("image-saved"));
            }, 500);
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
            setState((s) => ({
              ...s,
              generationProgress: undefined,
              generationPercent: undefined,
            }));
            onGeneratingChange(false); // 生成完了を親に通知
          },
          isActualCacheHit ? 800 : 1500
        );
      } catch (error: unknown) {
        setState((s) => ({
          ...s,
          generationProgress: undefined,
          generationPercent: undefined,
        }));
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
        if (!isPending) {
          handleGenerate();
        }
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

      <button
        type="submit"
        className={`w-full transition-all duration-200 bg-gradient-to-r from-cyan-400 to-purple-600 text-white border-0 shadow-lg shadow-cyan-400/20 rounded-md px-3 py-2 text-sm font-medium ${
          isPending ? "cursor-not-allowed" : "hover:scale-102 hover:shadow-xl hover:shadow-cyan-400/30"
        }`}
        onClick={isPending ? (e) => e.preventDefault() : undefined}
      >
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
            className={`w-full transition-all duration-200 rounded-md px-3 py-2 text-sm font-medium border-0 ${
              isDisabled
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-400 to-purple-600 text-white shadow-lg shadow-cyan-400/20 hover:scale-102 hover:shadow-xl hover:shadow-cyan-400/30"
            }`}
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

// 生成タイプ選択コンポーネント
function GenerationTypeSelector() {
  const { state, setState } = useQrStyle();

  const onChange = (generationType: typeof state.generationType) => {
    // 生成中は変更を無効化
    if (state.isGeneratingAI) return;

    setState((s) => ({
      ...s,
      generationType,
      // タイプ変更時に関連する状態をクリア
      logoDataUrl: undefined,
      artisticQrDataUrl: undefined,
      uploadedImageUrl: undefined,
    }));
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">生成タイプ</label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange("logo")}
          disabled={state.isGeneratingAI}
          className={`px-3 py-2 text-sm font-medium rounded-md border transition-all duration-200 ${
            state.isGeneratingAI
              ? "opacity-50 cursor-not-allowed bg-gray-300 text-gray-500"
              : state.generationType === "logo"
              ? "bg-gradient-to-r from-cyan-400 to-purple-600 text-white border-transparent shadow-lg"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            AIロゴ
          </div>
        </button>
        <button
          type="button"
          onClick={() => onChange("artistic")}
          disabled={state.isGeneratingAI}
          className={`px-3 py-2 text-sm font-medium rounded-md border transition-all duration-200 ${
            state.isGeneratingAI
              ? "opacity-50 cursor-not-allowed bg-gray-300 text-gray-500"
              : state.generationType === "artistic"
              ? "bg-gradient-to-r from-pink-400 to-orange-600 text-white border-transparent shadow-lg"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
              />
            </svg>
            アートQR
          </div>
        </button>
      </div>
      <p className="text-xs text-gray-500">{state.generationType === "logo" ? "QRコードにロゴを追加します" : "読み取り可能なアートQRコードを生成します"}</p>
    </div>
  );
}

// アートQRコード生成コンポーネント
function ArtisticQRGenerator({ onGeneratingChange }: { onGeneratingChange: (isGenerating: boolean) => void }) {
  const { state, setState } = useQrStyle();
  const [isPending, startTransition] = useTransition();
  const [isPublic, setIsPublic] = React.useState(true);

  const onChange = <K extends keyof typeof state>(key: K, value: (typeof state)[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  };

  const handleGenerate = async () => {
    const userPrompt = state.aiPrompt.trim();
    if (!userPrompt || !state.text) return;

    onGeneratingChange(true);
    setState((s) => ({
      ...s,
      generationProgress: "アートQRコードを生成中...",
      generationPercent: 0,
    }));

    startTransition(async () => {
      try {
        const updateProgress = (percent: number, message: string) => {
          setState((s) => ({
            ...s,
            generationProgress: message,
            generationPercent: percent,
          }));
        };

        const startTime = Date.now();
        const progressTimeouts: NodeJS.Timeout[] = [];

        // 段階的な進捗表示
        progressTimeouts.push(setTimeout(() => updateProgress(10, "AIサーバーに接続中..."), 100));
        progressTimeouts.push(setTimeout(() => updateProgress(20, "アートQRコードを生成中..."), 500));
        progressTimeouts.push(setTimeout(() => updateProgress(35, "高品質画像を生成中..."), 2000));

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒タイムアウト

        const res = await fetch("/api/artistic-qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: state.text,
            prompt: userPrompt,
            styleType: state.styleType,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        progressTimeouts.forEach((timeout) => clearTimeout(timeout));

        if (!res.ok) {
          const err = await safeJson(res);
          throw new Error(err?.error || res.statusText);
        }

        updateProgress(60, "画像を受信中...");
        const json = await res.json();

        updateProgress(90, "最終調整中...");
        await new Promise((resolve) => setTimeout(resolve, 500));

        setState((s) => ({
          ...s,
          artisticQrDataUrl: json.dataUrl, // 生成されたアートQRコード
          actualQrDataUrl: json.actualQrCode, // フォールバック用の通常QRコード
          logoDataUrl: undefined, // アートQR生成時はロゴをクリア
          uploadedImageUrl: undefined,
        }));

        // 画像を自動保存
        if (json.dataUrl) {
          try {
            await saveArtisticQRToSupabase(json.dataUrl, userPrompt, state.styleType, isPublic, state.text);
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent("artistic-qr-saved")); // アートQR専用イベント
            }, 500);
          } catch (saveError) {
            console.error("Failed to save artistic QR:", saveError);
          }
        }

        updateProgress(100, "完了！");
        setTimeout(() => {
          setState((s) => ({
            ...s,
            generationProgress: undefined,
            generationPercent: undefined,
          }));
          onGeneratingChange(false);
        }, 1500);
      } catch (error: unknown) {
        setState((s) => ({
          ...s,
          generationProgress: undefined,
          generationPercent: undefined,
        }));
        onGeneratingChange(false);
        const err = error as Error;
        if (err.name === "AbortError") {
          alert("生成がタイムアウトしました。もう一度お試しください。");
        } else {
          alert(`アートQRコード生成に失敗しました: ${err.message || "不明なエラー"}`);
        }
      }
    });
  };

  const saveArtisticQRToSupabase = async (imageDataUrl: string, prompt: string, styleType: string, isPublic: boolean, qrText: string) => {
    const response = await fetch("/api/save-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `[アートQR] ${prompt}`,
        originalPrompt: prompt,
        styleType,
        imageDataUrl,
        isPublic,
        qrText,
        isArtisticQR: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save artistic QR");
    }

    return response.json();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!isPending) {
          handleGenerate();
        }
      }}
      className="space-y-3"
    >
      <label className="block text-sm font-medium">アートQRコード生成</label>

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
        placeholder="例: 走っている猫、宇宙の星空、桜の花びら..."
        value={state.aiPrompt}
        onChange={(e) => onChange("aiPrompt", e.target.value)}
        disabled={isPending}
      />

      <button
        type="submit"
        className={`w-full transition-all duration-200 bg-gradient-to-r from-pink-400 to-orange-600 text-white border-0 shadow-lg shadow-pink-400/20 rounded-md px-3 py-2 text-sm font-medium ${
          isPending ? "cursor-not-allowed" : "hover:scale-102 hover:shadow-xl hover:shadow-pink-400/30"
        }`}
        disabled={isPending || !state.text.trim()}
      >
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
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
              />
            </svg>
            アートQRを生成
          </span>
        )}
      </button>

      {!state.text.trim() && <p className="text-xs text-red-500 text-center">URLを入力してください</p>}
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
