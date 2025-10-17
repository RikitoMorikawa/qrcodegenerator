"use client";

import React, { useEffect, useRef, useState } from "react";
import { useQrStyle } from "@/context/qrStyle";
import { Upload, X, CheckCircle } from "lucide-react";

// 透明な画像を作成する関数
const createTransparentImage = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, 100, 100); // 完全に透明
  }
  return canvas.toDataURL("image/png");
};

// 成功ダイアログコンポーネント
const SuccessDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-700">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">公開完了！</h3>
          <div className="text-gray-300 mb-6">QRコードがギャラリーに公開されました</div>
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-medium"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

// カスタム確認ダイアログコンポーネント
const ConfirmDialog = ({ isOpen, onClose, onConfirm, url }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; url: string }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-0 max-w-md w-full shadow-2xl border border-gray-700">
        {/* ヘッダー部分 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-6 rounded-t-2xl text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Upload size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-bold">QRコードを公開</h3>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* コンテンツ部分 */}
        <div className="p-6">
          <div className="text-gray-300 mb-4 text-base leading-relaxed">このQRコードをギャラリーに公開します。</div>

          {/* URL表示ボックス */}
          <div className="bg-gradient-to-r from-gray-800 to-blue-900/50 p-4 rounded-xl border border-gray-600 mb-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <div className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>公開されるURL:</span>
            </div>
            <div className="text-sm font-mono text-gray-100 break-all bg-gray-800 px-3 py-2 rounded-lg border border-gray-600">{url}</div>
          </div>

          {/* 警告メッセージ */}
          <div className="bg-amber-900/30 border border-amber-700/50 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div className="text-sm text-amber-200 leading-relaxed">公開されると、他のユーザーもこのQRコードとURLを見ることができるようになります。</div>
            </div>
          </div>
        </div>

        {/* ボタン部分 */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-300 border border-gray-600 rounded-xl hover:bg-gray-800 hover:border-gray-500 transition-all duration-200 font-medium"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl hover:from-blue-700 hover:to-purple-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            公開する
          </button>
        </div>
      </div>
    </div>
  );
};

export default function QRCodePreview() {
  const { state } = useQrStyle();
  const containerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const qrRef = useRef<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [hasPublished, setHasPublished] = useState(false);

  // アートQRコードの場合は通常のQRコード生成をスキップ
  const isArtisticMode = state.generationType === "artistic" && state.artisticQrDataUrl;

  // client-side only: dynamic import and create instance
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const mod = await import("qr-code-styling");
      if (!isMounted) return;
      const QRCodeStyling = mod.default;
      // 透明画像を作成
      const transparentImage = createTransparentImage();

      qrRef.current = new QRCodeStyling({
        data: state.text,
        width: 512,
        height: 512,
        margin: 8,
        // 初期化時から読み取り性重視の設定
        qrOptions: {
          errorCorrectionLevel: "H",
          typeNumber: 8, // 高密度で読み取り性向上
        },
        dotsOptions: {
          type: "square", // デフォルトは四角（読み取り最適化）
        },
        cornersSquareOptions: {
          type: "square", // デフォルトは四角（読み取り最適化）
        },
        cornersDotOptions: {
          type: "square", // デフォルトは四角（読み取り最適化）
        },
        // 初期状態でも中央をクリアにする
        image: transparentImage,
        imageOptions: {
          margin: -15, // より大きなマイナスマージンで背景スペースを大幅に削減
          imageSize: 0.7, // ロゴを70%に少し縮小
          hideBackgroundDots: true, // 背景は隠してロゴ本体のみクリア
        },
      });
      if (containerRef.current) {
        qrRef.current.append(containerRef.current);
      }
      updateQr();
    })();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update when state changes
  useEffect(() => {
    if (!isArtisticMode) {
      updateQr();
    }
    // ロゴが変更された時は公開状態をリセット
    setHasPublished(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, isArtisticMode]);

  // リサイズ時にQRコードサイズを調整
  useEffect(() => {
    const handleResize = () => {
      updateQr();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const updateQr = () => {
    if (!qrRef.current) return;
    const logoEnabled = Boolean(state.logoDataUrl);

    // スマホ対応: 画面サイズに応じてQRコードサイズを調整
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const qrSize = isMobile ? Math.min(400, window.innerWidth - 60) : 512;

    // Always pass imageOptions to avoid lib accessing undefined.hideBackgroundDots
    const imageOptions = {
      crossOrigin: "anonymous",
      margin: -15, // より大きなマイナスマージンで背景スペースを大幅に削減
      imageSize: 0.7, // ロゴエリアは統一して70%
      hideBackgroundDots: true, // 背景は隠してロゴ本体のみクリア
      saveAsBlob: true, // 透明背景をサポート
      // 超高品質レンダリング設定
      quality: 1.0,
      smoothing: true,
      // エッジの品質向上
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high",
    };
    qrRef.current.update({
      data: state.text,
      width: qrSize, // レスポンシブサイズ
      height: qrSize, // レスポンシブサイズ
      margin: 8, // 適度なマージンでクワイエットゾーンを確保
      qrOptions: {
        errorCorrectionLevel: "H", // 最高エラー訂正レベル（30%まで復元可能）
        mode: "Byte",
        typeNumber: 8, // 高密度でより多くのQRコード領域を確保
      },
      backgroundOptions: {
        color: state.bgColor,
        gradient: null,
      },
      // カスタマイズ可能なスタイル
      dotsOptions: {
        type: state.dotsStyle, // 選択されたドットスタイル
        color: state.color,
        gradient: null,
      },
      // カスタマイズ可能なコーナー
      cornersSquareOptions: {
        type: state.cornersStyle, // 選択されたコーナースタイル
        color: state.color,
        gradient: null,
      },
      cornersDotOptions: {
        type: state.cornersStyle, // 選択されたコーナースタイル
        color: state.color,
        gradient: null,
      },
      // 常に画像を設定（ロゴがない場合は透明画像で中央をクリア）
      image: logoEnabled ? state.logoDataUrl : createTransparentImage(),
      imageOptions,
    });
  };

  const handleDownload = async (ext: "png" | "jpeg" | "webp" | "svg") => {
    if (isArtisticMode && state.artisticQrDataUrl) {
      // アートQRコードの場合は直接ダウンロード
      const link = document.createElement("a");
      link.href = state.artisticQrDataUrl;
      link.download = `artistic-qr-code.${ext === "svg" ? "png" : ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (qrRef.current) {
      await qrRef.current.download({ extension: ext, name: "qr-code" });
    }
  };

  // 公開可能かどうかの判定（AI生成ロゴのみ公開可能、アートQRは専用ギャラリーへ）
  const canPublish = Boolean(
    state.logoDataUrl && !state.uploadedImageUrl && state.generationType === "logo" // AI生成ロゴのみ
  );

  const handlePublishClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmPublish = async () => {
    setShowConfirmDialog(false);
    try {
      await saveQRCodeToGallery();
      setHasPublished(true); // 公開完了後にフラグを設定
      setShowSuccessDialog(true);
    } catch (error) {
      // エラーハンドリングは既にsaveQRCodeToGallery内で行われている
    }
  };

  const saveQRCodeToGallery = async () => {
    try {
      let dataUrl: string;
      let qrInfo: unknown;

      if (isArtisticMode && state.artisticQrDataUrl) {
        // アートQRコードの場合
        dataUrl = state.artisticQrDataUrl;
        qrInfo = {
          url: state.text,
          logoType: "アートQRコード",
          style: `アート生成・${state.styleType}スタイル`,
          colors: "フルカラー",
          isArtisticQR: true,
        };
      } else if (qrRef.current) {
        // 通常のQRコードの場合
        const blob = await qrRef.current.getRawData("png");
        if (!blob) {
          throw new Error("QRコードの画像データを取得できませんでした");
        }

        // BlobをBase64に変換
        const reader = new FileReader();
        dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        qrInfo = {
          url: state.text,
          logoType: state.logoDataUrl ? "AI生成ロゴ" : "ロゴなし",
          style: `${state.dotsStyle}ドット・${state.cornersStyle}コーナー`,
          colors: `QR:${state.color} / 背景:${state.bgColor}`,
          isArtisticQR: false,
        };
      } else {
        throw new Error("QRコードデータが見つかりません");
      }

      // Supabaseに保存
      const response = await fetch("/api/save-qrcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrDataUrl: dataUrl,
          qrInfo,
          isPublic: true,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // ギャラリーを更新するためのイベントを発火
        window.dispatchEvent(new CustomEvent("qrcode-saved"));
      } else {
        throw new Error(result.error || "保存に失敗しました");
      }
    } catch (error) {
      console.error("QRコード保存エラー:", error);
      throw error; // エラーを再スローして上位でハンドリング
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
      <div
        className={`rounded-lg border p-2 max-w-full overflow-hidden relative ${state.isGeneratingAI ? "pointer-events-none" : ""}`}
        style={{
          width: "min(528px, 100%)", // スマホでは画面幅に合わせる
          height: "min(528px, calc(100vw - 40px))", // スマホでは正方形に調整、若干上下スペース追加
          backgroundColor: isArtisticMode ? "#f3f4f6" : state.bgColor, // アートQRコードの場合は中性的な背景
        }}
      >
        {/* 通常のQRコード（背景レイヤー） */}
        {!isArtisticMode && <div ref={containerRef} className="absolute inset-0 flex items-center justify-center" />}

        {/* アートQRコード（背景レイヤー） */}
        {isArtisticMode && state.artisticQrDataUrl && !state.isGeneratingAI && (
          <img
            src={state.artisticQrDataUrl}
            alt="Artistic QR Code"
            className="absolute inset-0 w-full h-full object-contain rounded p-2"
          />
        )}

        {/* AI生成中のプログレス表示（最前面レイヤー） */}
        {state.isGeneratingAI && state.generationProgress && (
          <div
            className={`absolute inset-0 rounded-lg flex items-center justify-center overflow-hidden z-50 ${
              state.generationType === "artistic"
                ? "bg-gradient-to-br from-pink-900 via-purple-900 to-orange-900"
                : "bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-800"
            }`}
          >
            {/* 背景パーティクル */}
            <div className="absolute inset-0">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white opacity-10 animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: `${Math.random() * 4 + 2}px`,
                    height: `${Math.random() * 4 + 2}px`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${Math.random() * 3 + 2}s`,
                  }}
                />
              ))}
            </div>

            {/* プログレスコンテンツ */}
            <div className="relative text-center p-6 z-10">
              <div className="mb-6">
                <div className="relative inline-block">
                  <div
                    className={`absolute inset-0 rounded-full border-4 border-transparent animate-spin ${
                      state.generationType === "artistic"
                        ? "border-t-pink-400 border-r-orange-400"
                        : "border-t-blue-400 border-r-purple-400"
                    }`}
                    style={{ width: "60px", height: "60px", left: "-6px", top: "-6px" }}
                  />
                  <svg
                    className={`animate-spin h-12 w-12 mx-auto ${
                      state.generationType === "artistic" ? "text-pink-300" : "text-blue-300"
                    }`}
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {state.generationType === "artistic" ? "アートQRコード生成中" : "AI画像生成中"}
              </h3>
              <p
                className={`font-semibold mb-4 ${
                  state.generationType === "artistic" ? "text-pink-200" : "text-blue-200"
                }`}
              >
                {state.generationProgress}
              </p>
              {state.generationPercent !== undefined && (
                <div className="relative mb-4">
                  <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                    <div
                      className={`rounded-full h-3 transition-all duration-700 ease-out ${
                        state.generationType === "artistic"
                          ? "bg-gradient-to-r from-pink-400 via-purple-400 to-orange-400"
                          : "bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
                      }`}
                      style={{ width: `${state.generationPercent}%` }}
                    />
                  </div>
                  <div className="text-right mt-1">
                    <span
                      className={`text-xs font-semibold ${
                        state.generationType === "artistic" ? "text-pink-200" : "text-blue-200"
                      }`}
                    >
                      {state.generationPercent}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
        <button
          className={`btn text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 ${state.isGeneratingAI ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => handleDownload("png")}
          disabled={state.isGeneratingAI}
        >
          PNG
        </button>
        <button
          className={`btn text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 ${state.isGeneratingAI ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => handleDownload("jpeg")}
          disabled={state.isGeneratingAI}
        >
          JPEG
        </button>
        <button
          className={`btn text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 ${state.isGeneratingAI ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => handleDownload("webp")}
          disabled={state.isGeneratingAI}
        >
          WEBP
        </button>
        <button
          className={`btn text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 ${state.isGeneratingAI ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => handleDownload("svg")}
          disabled={state.isGeneratingAI}
        >
          SVG
        </button>
        <button
          className={`btn text-xs px-2 py-1 flex items-center gap-1 ${
            canPublish && !hasPublished && !state.isGeneratingAI ? "btn-primary" : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
          onClick={canPublish && !hasPublished && !state.isGeneratingAI ? handlePublishClick : undefined}
          disabled={!canPublish || hasPublished || state.isGeneratingAI}
          title={
            state.isGeneratingAI
              ? "AI生成中は公開できません"
              : hasPublished
              ? "既に公開済みです"
              : !canPublish
              ? "AI生成ロゴのみ公開できます"
              : "QRコードを公開"
          }
        >
          <Upload size={12} />
          {hasPublished ? "公開済み" : "公開"}
        </button>
      </div>

      {/* カスタム確認ダイアログ */}
      <ConfirmDialog
        isOpen={showConfirmDialog && canPublish && !hasPublished}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmPublish}
        url={state.text}
      />

      {/* 成功ダイアログ */}
      <SuccessDialog isOpen={showSuccessDialog} onClose={() => setShowSuccessDialog(false)} />
    </div>
  );
}
