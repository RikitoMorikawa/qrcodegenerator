// QRコードの重要領域を保護しながらアートと合成するユーティリティ

// QRコードの重要領域を特定する関数（最小限の保護）
function getQRProtectedRegions(size: number) {
  const moduleSize = size / 29; // より密なQRコードを想定（余白最小化）
  const regions = [];

  // 位置検出パターン（3つの角の正方形のみ、最小限に）
  // 左上
  regions.push({
    x: moduleSize * 1,
    y: moduleSize * 1,
    width: moduleSize * 7,
    height: moduleSize * 7,
  });

  // 右上
  regions.push({
    x: size - moduleSize * 8,
    y: moduleSize * 1,
    width: moduleSize * 7,
    height: moduleSize * 7,
  });

  // 左下
  regions.push({
    x: moduleSize * 1,
    y: size - moduleSize * 8,
    width: moduleSize * 7,
    height: moduleSize * 7,
  });

  // タイミングパターンは最小限に（右下のアートエリアを避ける）
  regions.push({
    x: moduleSize * 8,
    y: moduleSize * 6,
    width: moduleSize * 10, // 右下を避けて短縮
    height: moduleSize,
  });

  regions.push({
    x: moduleSize * 6,
    y: moduleSize * 8,
    width: moduleSize,
    height: moduleSize * 10, // 右下を避けて短縮
  });

  return regions;
}

// ピクセルが保護領域内にあるかチェック
function isInProtectedRegion(x: number, y: number, protectedRegions: Array<{ x: number; y: number; width: number; height: number }>) {
  return protectedRegions.some((region) => x >= region.x && x < region.x + region.width && y >= region.y && y < region.y + region.height);
}

// エッジ検出関数（周辺ピクセルとの差を計算）
function checkForEdge(x: number, y: number, imageData: Uint8ClampedArray, width: number): boolean {
  const radius = 2; // 検出半径
  const threshold = 30; // エッジ検出の閾値

  const centerI = (y * width + x) * 4;
  const centerR = imageData[centerI];
  const centerG = imageData[centerI + 1];
  const centerB = imageData[centerI + 2];

  // 周辺ピクセルをチェック
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx === 0 && dy === 0) continue;

      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < width && ny >= 0 && ny < width) {
        const ni = (ny * width + nx) * 4;
        const nr = imageData[ni];
        const ng = imageData[ni + 1];
        const nb = imageData[ni + 2];

        // 色の差を計算
        const colorDiff = Math.abs(centerR - nr) + Math.abs(centerG - ng) + Math.abs(centerB - nb);

        if (colorDiff > threshold) {
          return true; // エッジを検出
        }
      }
    }
  }

  return false;
}

export async function combineQRWithArt(qrDataUrl: string, artDataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      resolve(qrDataUrl);
      return;
    }

    canvas.width = 1024;
    canvas.height = 1024;

    const qrImage = new Image();
    const artImage = new Image();

    let imagesLoaded = 0;
    const totalImages = 2;

    const onImageLoad = () => {
      imagesLoaded++;
      if (imagesLoaded === totalImages) {
        composeImages();
      }
    };

    const composeImages = () => {
      // QRコードの保護領域を取得
      const protectedRegions = getQRProtectedRegions(1024);

      // 1. 背景にアートを薄く描画
      ctx.globalAlpha = 0.15;
      ctx.drawImage(artImage, 0, 0, 1024, 1024);

      // 2. QRコードを描画
      ctx.globalAlpha = 1.0;
      ctx.drawImage(qrImage, 0, 0, 1024, 1024);

      // 3. ピクセルレベルでの精密な合成
      const imageData = ctx.getImageData(0, 0, 1024, 1024);
      const data = imageData.data;

      // アート画像のデータを取得
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) {
        resolve(canvas.toDataURL("image/png"));
        return;
      }

      tempCanvas.width = 1024;
      tempCanvas.height = 1024;
      tempCtx.drawImage(artImage, 0, 0, 1024, 1024);
      const artImageData = tempCtx.getImageData(0, 0, 1024, 1024);
      const artData = artImageData.data;

      // ピクセルごとに処理
      for (let y = 0; y < 1024; y++) {
        for (let x = 0; x < 1024; x++) {
          const i = (y * 1024 + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // 明度を計算
          const brightness = (r + g + b) / 3;

          // 保護領域内かチェック
          const isProtected = isInProtectedRegion(x, y, protectedRegions);

          if (!isProtected && brightness > 220) {
            // 保護領域外の非常に明るい部分にのみアートを適用
            const artR = artData[i];
            const artG = artData[i + 1];
            const artB = artData[i + 2];

            // 読み取り性を最優先にした控えめなブレンド
            const blendRatio = brightness > 240 ? 0.2 : 0.1;
            data[i] = Math.min(255, r * (1 - blendRatio) + artR * blendRatio);
            data[i + 1] = Math.min(255, g * (1 - blendRatio) + artG * blendRatio);
            data[i + 2] = Math.min(255, b * (1 - blendRatio) + artB * blendRatio);
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };

    qrImage.onload = onImageLoad;
    artImage.onload = onImageLoad;

    qrImage.onerror = () => resolve(qrDataUrl);
    artImage.onerror = () => resolve(qrDataUrl);

    qrImage.src = qrDataUrl;
    artImage.src = artDataUrl;
  });
}

// 読み取り性を最優先にした安全な合成方法
export async function addArtBackground(qrDataUrl: string, artDataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      resolve(qrDataUrl);
      return;
    }

    canvas.width = 1024;
    canvas.height = 1024;

    const qrImage = new Image();
    const artImage = new Image();

    let imagesLoaded = 0;

    const onImageLoad = () => {
      imagesLoaded++;
      if (imagesLoaded === 2) {
        // 1. アート背景を非常に薄く描画（読み取り性を最優先）
        ctx.globalAlpha = 0.08;
        ctx.drawImage(artImage, 0, 0, 1024, 1024);

        // 2. QRコードを完全不透明で上に描画
        ctx.globalAlpha = 1.0;
        ctx.drawImage(qrImage, 0, 0, 1024, 1024);

        resolve(canvas.toDataURL("image/png"));
      }
    };

    qrImage.onload = onImageLoad;
    artImage.onload = onImageLoad;

    qrImage.onerror = () => resolve(qrDataUrl);
    artImage.onerror = () => resolve(qrDataUrl);

    qrImage.src = qrDataUrl;
    artImage.src = artDataUrl;
  });
}

// カラフルで魅力的なアートQRコード生成（読み取り性を保持）
export async function createReadableArtQR(qrDataUrl: string, artDataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      resolve(qrDataUrl);
      return;
    }

    canvas.width = 1024;
    canvas.height = 1024;

    const qrImage = new Image();
    const artImage = new Image();

    let imagesLoaded = 0;

    const onImageLoad = () => {
      imagesLoaded++;
      if (imagesLoaded === 2) {
        composeColorfulArt();
      }
    };

    const composeColorfulArt = () => {
      // QRコードの保護領域を取得
      const protectedRegions = getQRProtectedRegions(1024);

      // 1. アート背景を描画（より積極的に）
      ctx.globalAlpha = 0.3;
      ctx.drawImage(artImage, 0, 0, 1024, 1024);

      // 2. QRコードを描画
      ctx.globalAlpha = 1.0;
      ctx.drawImage(qrImage, 0, 0, 1024, 1024);

      // 3. ピクセルレベルでの精密処理
      const imageData = ctx.getImageData(0, 0, 1024, 1024);
      const data = imageData.data;

      // アート画像のデータを取得
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) {
        resolve(canvas.toDataURL("image/png"));
        return;
      }

      tempCanvas.width = 1024;
      tempCanvas.height = 1024;
      tempCtx.drawImage(artImage, 0, 0, 1024, 1024);
      const artImageData = tempCtx.getImageData(0, 0, 1024, 1024);
      const artData = artImageData.data;

      // ピクセルごとに処理
      for (let y = 0; y < 1024; y++) {
        for (let x = 0; x < 1024; x++) {
          const i = (y * 1024 + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // 明度を計算
          const brightness = (r + g + b) / 3;

          // 保護領域内かチェック
          const isProtected = isInProtectedRegion(x, y, protectedRegions);

          if (!isProtected) {
            const artR = artData[i];
            const artG = artData[i + 1];
            const artB = artData[i + 2];

            if (brightness > 240) {
              // 非常に白い部分：カラフルなアートを積極的に適用
              const blendRatio = 0.6; // より積極的なブレンド
              data[i] = Math.min(255, r * (1 - blendRatio) + artR * blendRatio);
              data[i + 1] = Math.min(255, g * (1 - blendRatio) + artG * blendRatio);
              data[i + 2] = Math.min(255, b * (1 - blendRatio) + artB * blendRatio);
            } else if (brightness > 200) {
              // 明るいグレー部分：中程度のアート適用
              const blendRatio = 0.4;
              data[i] = Math.min(255, r * (1 - blendRatio) + artR * blendRatio);
              data[i + 1] = Math.min(255, g * (1 - blendRatio) + artG * blendRatio);
              data[i + 2] = Math.min(255, b * (1 - blendRatio) + artB * blendRatio);
            } else if (brightness > 150) {
              // 中間的な明るさ：薄くアートを適用
              const blendRatio = 0.2;
              data[i] = Math.min(255, r * (1 - blendRatio) + artR * blendRatio);
              data[i + 1] = Math.min(255, g * (1 - blendRatio) + artG * blendRatio);
              data[i + 2] = Math.min(255, b * (1 - blendRatio) + artB * blendRatio);
            }
            // 黒い部分（brightness < 150）は保持してコントラストを維持
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };

    qrImage.onload = onImageLoad;
    artImage.onload = onImageLoad;

    qrImage.onerror = () => resolve(qrDataUrl);
    artImage.onerror = () => resolve(qrDataUrl);

    qrImage.src = qrDataUrl;
    artImage.src = artDataUrl;
  });
}

// 右下配置で読み取り性を最優先にしたアートQRコード生成
export async function createVibrantArtQR(qrDataUrl: string, artDataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      resolve(qrDataUrl);
      return;
    }

    canvas.width = 1024;
    canvas.height = 1024;

    const qrImage = new Image();
    const artImage = new Image();

    let imagesLoaded = 0;

    const onImageLoad = () => {
      imagesLoaded++;
      if (imagesLoaded === 2) {
        composeBottomRightArt();
      }
    };

    const composeBottomRightArt = () => {
      // 1. QRコードを全面に描画
      ctx.drawImage(qrImage, 0, 0, 1024, 1024);

      // 2. 右下のアートエリアを定義（プロンプトに沿ったものの全体像を表示）
      const artSize = 1024 * 0.35; // 右下35%のエリア（全体像が見えるサイズ）
      const artCenterX = 1024 - artSize / 2 - 1024 * 0.06; // 右端から6%内側
      const artCenterY = 1024 - artSize / 2 - 1024 * 0.06; // 下端から6%内側
      const artRadius = artSize / 2;

      // 3. QRコードとアートの元データを取得
      const qrCanvas = document.createElement("canvas");
      const qrCtx = qrCanvas.getContext("2d");
      if (!qrCtx) {
        resolve(canvas.toDataURL("image/png"));
        return;
      }

      qrCanvas.width = 1024;
      qrCanvas.height = 1024;
      qrCtx.drawImage(qrImage, 0, 0, 1024, 1024);
      const qrImageData = qrCtx.getImageData(0, 0, 1024, 1024);
      const qrData = qrImageData.data;

      // アート画像の元データを取得
      const artCanvas = document.createElement("canvas");
      const artCtx = artCanvas.getContext("2d");
      if (!artCtx) {
        resolve(canvas.toDataURL("image/png"));
        return;
      }

      artCanvas.width = 1024;
      artCanvas.height = 1024;
      artCtx.drawImage(artImage, 0, 0, 1024, 1024);
      const artImageData = artCtx.getImageData(0, 0, 1024, 1024);
      const artData = artImageData.data;

      // QRコードの保護領域を取得
      const protectedRegions = getQRProtectedRegions(1024);

      // 現在のキャンバスデータを取得
      const currentImageData = ctx.getImageData(0, 0, 1024, 1024);
      const data = currentImageData.data;

      // ピクセルごとに処理
      for (let y = 0; y < 1024; y++) {
        for (let x = 0; x < 1024; x++) {
          const i = (y * 1024 + x) * 4;

          // 右下のアートエリアからの距離を計算
          const distanceFromArtCenter = Math.sqrt(Math.pow(x - artCenterX, 2) + Math.pow(y - artCenterY, 2));

          // QRコードの明度を計算
          const qrBrightness = (qrData[i] + qrData[i + 1] + qrData[i + 2]) / 3;

          // 1. まずアート画像を全面に表示（背景として）
          data[i] = artData[i];
          data[i + 1] = artData[i + 1];
          data[i + 2] = artData[i + 2];

          // アートの形状に基づいて表示（保護領域の特別処理なし）
          const artR = artData[i];
          const artG = artData[i + 1];
          const artB = artData[i + 2];

          // アートピクセルの明度と彩度を計算
          const artBrightness = (artR + artG + artB) / 3;
          const maxColor = Math.max(artR, artG, artB);
          const minColor = Math.min(artR, artG, artB);
          const saturation = maxColor > 0 ? (maxColor - minColor) / maxColor : 0;

          // 周辺ピクセルとの差を計算（エッジ検出）
          const hasEdge = checkForEdge(x, y, artData, 1024);

          // 背景かどうかを判定（より精密に）
          const isBackground =
            ((artBrightness > 220 && saturation < 0.2) || (artBrightness > 180 && saturation < 0.1) || (artR > 240 && artG > 240 && artB > 240)) && !hasEdge;

          // 右下の円形エリア内かどうかをチェック（厳密な円形制限）
          const isInCircle = distanceFromArtCenter < artRadius;

          if (isInCircle) {
            // 円形エリア内：円の中だけのアートを表示（背景全体とは別）

            // 円の中心からの相対位置を計算（0-1の範囲）
            const relativeX = (x - (artCenterX - artRadius)) / (artRadius * 2);
            const relativeY = (y - (artCenterY - artRadius)) / (artRadius * 2);

            // 円の中心に配置するためのアート座標を計算
            const circleArtX = Math.floor(relativeX * 1024);
            const circleArtY = Math.floor(relativeY * 1024);

            // 座標が有効範囲内かチェック
            if (circleArtX >= 0 && circleArtX < 1024 && circleArtY >= 0 && circleArtY < 1024) {
              const circleArtI = (circleArtY * 1024 + circleArtX) * 4;
              const circleArtR = artData[circleArtI];
              const circleArtG = artData[circleArtI + 1];
              const circleArtB = artData[circleArtI + 2];

              // 円の中のアートピクセルの分析
              const circleArtBrightness = (circleArtR + circleArtG + circleArtB) / 3;
              const maxColor = Math.max(circleArtR, circleArtG, circleArtB);
              const minColor = Math.min(circleArtR, circleArtG, circleArtB);
              const saturation = maxColor > 0 ? (maxColor - minColor) / maxColor : 0;

              // エッジ検出
              const hasEdge = checkForEdge(circleArtX, circleArtY, artData, 1024);

              // 背景かどうかを判定
              const isCircleBackground =
                ((circleArtBrightness > 220 && saturation < 0.2) ||
                  (circleArtBrightness > 180 && saturation < 0.1) ||
                  (circleArtR > 240 && circleArtG > 240 && circleArtB > 240)) &&
                !hasEdge;

              if (!isCircleBackground) {
                // 円の中のアートの主要部分（猫など）：アートをそのまま鮮明に表示
                data[i] = circleArtR;
                data[i + 1] = circleArtG;
                data[i + 2] = circleArtB;
              } else {
                // 円の中の背景部分：QRコードとアートを軽くブレンド
                if (qrBrightness < 100) {
                  // QRの黒い部分：アートの背景色を暗くしてQRを見やすく
                  data[i] = Math.min(circleArtR * 0.3, 50);
                  data[i + 1] = Math.min(circleArtG * 0.3, 50);
                  data[i + 2] = Math.min(circleArtB * 0.3, 50);
                } else {
                  // QRの白い部分：アートの背景色を明るくしてコントラスト確保
                  const brightnessBoost = 1.6;
                  data[i] = Math.min(circleArtR * brightnessBoost, 240);
                  data[i + 1] = Math.min(circleArtG * brightnessBoost, 240);
                  data[i + 2] = Math.min(circleArtB * brightnessBoost, 240);
                }
              }
            } else {
              // 座標が無効な場合はQRコードを表示
              data[i] = qrData[i];
              data[i + 1] = qrData[i + 1];
              data[i + 2] = qrData[i + 2];
            }
          } else {
            // アートエリア外：QRコードを優先表示（高コントラスト）
            if (qrBrightness < 100) {
              // QRコードの黒い部分：完全に黒で表示
              data[i] = 0;
              data[i + 1] = 0;
              data[i + 2] = 0;
            } else {
              // QRコードの白い部分：アートの明度を大幅に上げてコントラスト確保
              const brightnessBoost = 2.0;
              const minBrightness = 180;

              data[i] = Math.max(Math.min(artR * brightnessBoost, 255), minBrightness);
              data[i + 1] = Math.max(Math.min(artG * brightnessBoost, 255), minBrightness);
              data[i + 2] = Math.max(Math.min(artB * brightnessBoost, 255), minBrightness);
            }
          }
        }
      }

      ctx.putImageData(currentImageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };

    qrImage.onload = onImageLoad;
    artImage.onload = onImageLoad;

    qrImage.onerror = () => resolve(qrDataUrl);
    artImage.onerror = () => resolve(qrDataUrl);

    qrImage.src = qrDataUrl;
    artImage.src = artDataUrl;
  });
}
