/**
 * 白背景を透明に変換する関数
 */
export function removeWhiteBackground(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(dataUrl); // 処理できない場合は元の画像を返す
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // 画像を描画
      ctx.drawImage(img, 0, 0);

      // 画像データを取得
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 白背景を透明に変換
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // 白に近い色を透明にする（閾値: 240）
        if (r > 240 && g > 240 && b > 240) {
          data[i + 3] = 0; // アルファ値を0（透明）に設定
        }
      }

      // 処理済み画像データを描画
      ctx.putImageData(imageData, 0, 0);

      // 透明背景のPNGとして出力
      const processedDataUrl = canvas.toDataURL("image/png");
      resolve(processedDataUrl);
    };

    img.onerror = () => {
      resolve(dataUrl); // エラーの場合は元の画像を返す
    };

    img.src = dataUrl;
  });
}

/**
 * より高精度な背景除去（エッジ周辺も考慮）
 */
export function removeBackgroundAdvanced(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // より積極的な背景除去（はみ出しを防ぐため）
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // 白〜薄いグレーを透明にする
        const brightness = (r + g + b) / 3;
        const colorVariance = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

        // より積極的に背景を除去（閾値を下げる）
        if (brightness > 200 && colorVariance < 30) {
          // 白に近く、色の変化が少ない場合は透明にする
          data[i + 3] = 0;
        } else if (brightness > 230) {
          // 明るい場合は透明にする（閾値を下げる）
          data[i + 3] = 0;
        } else if (brightness > 180 && colorVariance < 20) {
          // 薄いグレーも透明にする（閾値を下げる）
          data[i + 3] = 0;
        } else if (brightness > 160 && colorVariance < 15) {
          // 中間的な明るさでも色の変化が少ない場合は透明にする
          data[i + 3] = 0;
        } else if (brightness > 140 && brightness < 180 && colorVariance < 10) {
          // さらに中間的な明るさも半透明にする
          data[i + 3] = Math.floor(a * 0.2);
        }
      }

      // エッジ処理：画像の端から内側に向かって背景色をチェック
      const width = canvas.width;
      const height = canvas.height;

      // 四隅と端の色をサンプリングして背景色を特定
      const cornerColors = [
        [data[0], data[1], data[2]], // 左上
        [data[(width - 1) * 4], data[(width - 1) * 4 + 1], data[(width - 1) * 4 + 2]], // 右上
        [data[(height - 1) * width * 4], data[(height - 1) * width * 4 + 1], data[(height - 1) * width * 4 + 2]], // 左下
        [
          data[((height - 1) * width + (width - 1)) * 4],
          data[((height - 1) * width + (width - 1)) * 4 + 1],
          data[((height - 1) * width + (width - 1)) * 4 + 2],
        ], // 右下
      ];

      // 最も明るい角の色を背景色として使用
      const bgColor = cornerColors.reduce((brightest, current) => {
        const currentBrightness = (current[0] + current[1] + current[2]) / 3;
        const brightestBrightness = (brightest[0] + brightest[1] + brightest[2]) / 3;
        return currentBrightness > brightestBrightness ? current : brightest;
      });

      const bgBrightness = (bgColor[0] + bgColor[1] + bgColor[2]) / 3;

      // 背景色に近い色をより積極的に除去
      if (bgBrightness > 150) {
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const colorDistance = Math.sqrt(Math.pow(r - bgColor[0], 2) + Math.pow(g - bgColor[1], 2) + Math.pow(b - bgColor[2], 2));

          // 背景色に近い色（距離が50以下）を透明にする
          if (colorDistance < 50) {
            data[i + 3] = 0;
          } else if (colorDistance < 80) {
            // 少し離れた色も半透明にする
            data[i + 3] = Math.floor(data[i + 3] * 0.3);
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      const processedDataUrl = canvas.toDataURL("image/png");
      resolve(processedDataUrl);
    };

    img.onerror = () => {
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}
