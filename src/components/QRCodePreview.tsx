"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQrStyle } from "@/context/qrStyle";
import { Upload, X, CheckCircle, Sparkles, Palette, Zap, PartyPopper, Loader2, Download, ChevronDown } from "lucide-react";
import ArtisticQRSamples from "./ArtisticQRSamples";

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
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const downloadButtonRef = useRef<HTMLButtonElement>(null);

  // ドロップダウンの位置を計算
  const updateDropdownPosition = () => {
    if (downloadButtonRef.current) {
      const rect = downloadButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  // ドロップダウンメニューの外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // ダウンロードボタン内のクリックは無視
      if (downloadButtonRef.current && downloadButtonRef.current.contains(target)) {
        return;
      }

      // ドロップダウンメニュー内のクリックは無視
      const dropdownElement = document.querySelector(".download-dropdown-portal");
      if (dropdownElement && dropdownElement.contains(target)) {
        return;
      }

      setShowDownloadMenu(false);
    };

    const handleScroll = () => {
      if (showDownloadMenu) {
        updateDropdownPosition();
      }
    };

    const handleResize = () => {
      if (showDownloadMenu) {
        setShowDownloadMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [showDownloadMenu]);

  // アートQRコードの場合は通常のQRコード生成をスキップ
  const isArtisticMode = state.generationType === "artistic" && state.artisticQrDataUrl;
  // アートQR選択時でまだ生成していない場合はサンプルを表示
  const showArtisticSamples = state.generationType === "artistic" && !state.artisticQrDataUrl && !state.isGeneratingAI;
  // 通常のQRコードを表示する条件（より明確に）
  const showNormalQR = state.generationType !== "artistic" || (state.generationType === "artistic" && state.isGeneratingAI);

  // デバッグ用ログ
  console.log("QRCodePreview state:", {
    generationType: state.generationType,
    artisticQrDataUrl: !!state.artisticQrDataUrl,
    isGeneratingAI: state.isGeneratingAI,
    isArtisticMode,
    showArtisticSamples,
    showNormalQR,
  });

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
        margin: 4, // 最小限のマージンで全面表示
        // 読み取り性を最優先にした設定
        qrOptions: {
          errorCorrectionLevel: "H", // 最高エラー訂正レベル（30%まで復元可能）
          mode: "Byte", // バイトモードで安定性向上
          typeNumber: 6, // より細かい模様にするため固定値を指定（21x21 → 41x41ドット）
        },
        dotsOptions: {
          type: state.dotsStyle, // 動的にスタイルを適用
        },
        cornersSquareOptions: {
          type: state.cornersStyle, // 動的にスタイルを適用
        },
        cornersDotOptions: {
          type: state.cornersStyle, // 動的にスタイルを適用
        },
        // 初期状態でも中央をクリアにする
        image: transparentImage,
        imageOptions: {
          margin: 0, // 標準的なマージン（元に戻す）
          imageSize: 0.7, // ロゴを70%のサイズで表示（元に戻す）
          hideBackgroundDots: true, // 背景は隠してロゴ本体のみクリア
        },
      });
      if (containerRef.current) {
        qrRef.current.append(containerRef.current);
        console.log("QR code appended to container");
      }
      // 初期化後に必ずQRコードを更新
      setTimeout(() => {
        if (qrRef.current) {
          updateQr();
          console.log("Initial QR update completed");
        }
      }, 100);
    })();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update when state changes
  useEffect(() => {
    console.log("useEffect triggered, showNormalQR:", showNormalQR, "qrRef.current:", !!qrRef.current);
    if (showNormalQR && qrRef.current) {
      updateQr();
    }
    // ロゴが変更された時は公開状態をリセット
    setHasPublished(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, showNormalQR]);

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

    // 読み取り性を最優先にした画像オプション
    const imageOptions = {
      crossOrigin: "anonymous",
      margin: 0, // 標準的なマージン（元に戻す）
      imageSize: 0.7, // ロゴを70%のサイズで表示（元に戻す）
      hideBackgroundDots: true, // 背景は隠してロゴ本体のみクリア
      saveAsBlob: true, // 透明背景をサポート
      // 高品質レンダリング設定
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
      margin: 4, // 最小限のマージンで全面表示
      qrOptions: {
        errorCorrectionLevel: "H", // 最高エラー訂正レベル（30%まで復元可能）
        mode: "Byte", // バイトモードで安定性向上
        typeNumber: 6, // より細かい模様にするため固定値を指定（21x21 → 41x41ドット）
      },
      backgroundOptions: {
        color: state.bgColor,
        gradient: null,
      },
      // 動的スタイル設定
      dotsOptions: {
        type: state.dotsStyle, // 動的にスタイルを適用
        color: state.color,
        gradient: null,
      },
      // 動的コーナー設定
      cornersSquareOptions: {
        type: state.cornersStyle, // 動的にスタイルを適用
        color: state.color,
        gradient: null,
      },
      cornersDotOptions: {
        type: state.cornersStyle, // 動的にスタイルを適用
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

  // ダウンロード可能かどうかの判定（画像が添付されているかAI生成されている場合）
  const canDownload = Boolean(
    state.uploadedImageUrl || // 画像が添付されている
      state.logoDataUrl || // AI生成ロゴがある
      state.artisticQrDataUrl // アートQRコードが生成されている
    // 通常のQRコードのみの場合は非活性（画像やAI生成が必要）
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
        {/* 通常のQRコード（背景レイヤー） - 常に存在させて、表示/非表示で制御 */}
        <div ref={containerRef} className="absolute inset-0 flex items-center justify-center" style={{ display: showNormalQR ? "flex" : "none" }} />

        {/* アートQRサンプル表示 */}
        {showArtisticSamples && (
          <div className="absolute inset-0 w-full h-full">
            <ArtisticQRSamples />
          </div>
        )}

        {/* アートQRコード（背景レイヤー） */}
        {isArtisticMode && state.artisticQrDataUrl && !state.isGeneratingAI && (
          <div className="absolute inset-0 w-full h-full">
            <img src={state.artisticQrDataUrl} alt="Artistic QR Code" className="w-full h-full object-contain rounded p-2" />
            {/* フォールバック用QRコード表示ボタン */}
            {state.actualQrDataUrl && (
              <div className="absolute bottom-2 right-2 z-10">
                <button
                  onClick={() => {
                    // フォールバック用QRコードを表示するモーダルを開く
                    const modal = document.createElement("div");
                    modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
                    modal.innerHTML = `
                      <div class="bg-white p-6 rounded-lg max-w-sm mx-4">
                        <h3 class="text-lg font-semibold mb-4 text-center">通常のQRコード</h3>
                        <img src="${state.actualQrDataUrl}" alt="Fallback QR Code" class="w-full h-auto" />
                        <p class="text-sm text-gray-600 mt-2 text-center">アートQRコードが読み取れない場合はこちらをお使いください</p>
                        <button class="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">閉じる</button>
                      </div>
                    `;
                    modal.addEventListener("click", (e) => {
                      if (e.target === modal || (e.target as HTMLElement).tagName === "BUTTON") {
                        document.body.removeChild(modal);
                      }
                    });
                    document.body.appendChild(modal);
                  }}
                  className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 text-xs px-2 py-1 rounded shadow-lg transition-all"
                  title="通常のQRコードを表示"
                >
                  📱 QR
                </button>
              </div>
            )}
          </div>
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
                  {/* 外側の回転リング */}
                  <div
                    className={`absolute inset-0 rounded-full border-4 border-transparent animate-spin ${
                      state.generationType === "artistic" ? "border-t-pink-400 border-r-orange-400" : "border-t-blue-400 border-r-purple-400"
                    }`}
                    style={{ width: "80px", height: "80px", left: "-14px", top: "-14px", animationDuration: "1s" }}
                  />
                  {/* 中央のLoader2アイコン */}
                  <Loader2
                    size={52}
                    className={`animate-spin mx-auto ${state.generationType === "artistic" ? "text-pink-300" : "text-blue-300"}`}
                    style={{ animationDuration: "1.5s" }}
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{state.generationType === "artistic" ? "アートQRコード生成中" : "AI画像生成中"}</h3>
              <p className={`font-semibold mb-2 ${state.generationType === "artistic" ? "text-pink-200" : "text-blue-200"}`}>{state.generationProgress}</p>

              {/* 安心メッセージ */}
              <div className="mb-4">
                <div className="flex items-center justify-center gap-2 text-sm text-white/60 animate-pulse">
                  {state.generationPercent !== undefined && state.generationPercent < 25 ? (
                    <>
                      <Sparkles size={16} className="text-yellow-300" />
                      <span>AIが画像を生成しています...</span>
                    </>
                  ) : state.generationPercent !== undefined && state.generationPercent < 50 ? (
                    <>
                      <Palette size={16} className="text-purple-300" />
                      <span>高品質な画像を作成中...</span>
                    </>
                  ) : state.generationPercent !== undefined && state.generationPercent < 80 ? (
                    <>
                      <Zap size={16} className="text-blue-300" />
                      <span>もうすぐ完成します...</span>
                    </>
                  ) : (
                    <>
                      <PartyPopper size={16} className="text-pink-300" />
                      <span>最終調整中...</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-white/40 mt-1">このまましばらくお待ちください</p>
              </div>

              {state.generationPercent !== undefined && (
                <div className="relative mb-4">
                  <div className="bg-white/20 rounded-full h-3 overflow-hidden relative">
                    <div
                      className={`rounded-full h-3 transition-all duration-700 ease-out relative ${
                        state.generationType === "artistic"
                          ? "bg-gradient-to-r from-pink-400 via-purple-400 to-orange-400"
                          : "bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
                      }`}
                      style={{ width: `${state.generationPercent}%` }}
                    >
                      {/* 流れるアニメーション */}
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                        style={{ backgroundSize: "200% 100%" }}
                      />
                    </div>
                  </div>
                  <div className="text-right mt-1">
                    <span className={`text-xs font-semibold ${state.generationType === "artistic" ? "text-pink-200" : "text-blue-200"}`}>
                      {state.generationPercent}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-3 sm:gap-4 flex-wrap justify-center">
        {/* ダウンロードドロップダウンボタン */}
        <div className="relative">
          <button
            ref={downloadButtonRef}
            className={`rounded-lg px-4 sm:px-6 py-2 sm:py-3 text-sm font-medium shadow-lg backdrop-blur-sm transition-all duration-300 flex items-center gap-2 ${
              canDownload && !state.isGeneratingAI
                ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white border border-emerald-400/30 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/25"
                : "bg-gradient-to-r from-gray-600 to-gray-700 text-gray-400 border border-gray-600/30 cursor-not-allowed"
            }`}
            onClick={() => {
              if (canDownload && !state.isGeneratingAI) {
                if (!showDownloadMenu) {
                  updateDropdownPosition();
                }
                setShowDownloadMenu(!showDownloadMenu);
              }
            }}
            disabled={!canDownload || state.isGeneratingAI}
            title={state.isGeneratingAI ? "生成中はダウンロードできません" : !canDownload ? "画像を添付するかAI生成してください" : "ダウンロード形式を選択"}
          >
            <Download size={16} />
            ダウンロード
            <ChevronDown size={14} className={`transition-transform duration-200 ${showDownloadMenu ? "rotate-180" : ""}`} />
          </button>

          {/* ドロップダウンメニューをポータルで描画 */}
          {typeof window !== "undefined" &&
            createPortal(
              showDownloadMenu && canDownload && !state.isGeneratingAI ? (
                <div
                  style={{
                    position: "fixed",
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                    minWidth: dropdownPosition.width,
                    zIndex: 2147483647,
                  }}
                  className="download-dropdown-portal bg-gray-800 border border-gray-600 rounded-lg shadow-2xl shadow-black/90 overflow-hidden backdrop-blur-sm"
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDownload("png");
                      setShowDownloadMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-gray-700 transition-colors duration-150 flex items-center gap-3"
                  >
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    PNG（推奨）
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDownload("jpeg");
                      setShowDownloadMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-gray-700 transition-colors duration-150 flex items-center gap-3"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    JPEG
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDownload("webp");
                      setShowDownloadMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-gray-700 transition-colors duration-150 flex items-center gap-3"
                  >
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    WEBP
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDownload("svg");
                      setShowDownloadMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-gray-700 transition-colors duration-150 flex items-center gap-3"
                  >
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    SVG（ベクター）
                  </button>
                </div>
              ) : null,
              document.body
            )}
        </div>
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
