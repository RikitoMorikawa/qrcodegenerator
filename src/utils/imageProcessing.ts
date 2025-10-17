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

      // より高精度な背景除去
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // 白〜薄いグレーを透明にする
        const brightness = (r + g + b) / 3;
        const colorVariance = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

        if (brightness > 220 && colorVariance < 25) {
          // 白に近く、色の変化が少ない場合は透明にする
          data[i + 3] = 0;
        } else if (brightness > 240) {
          // 非常に明るい場合は透明にする
          data[i + 3] = 0;
        } else if (brightness > 200 && colorVariance < 15) {
          // 薄いグレーも透明にする
          data[i + 3] = 0;
        } else if (brightness > 180 && brightness < 220 && colorVariance < 10) {
          // 中間的な明るさでも色の変化が少ない場合は半透明にする
          data[i + 3] = Math.floor(a * 0.3);
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
