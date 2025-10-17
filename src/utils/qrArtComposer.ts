// QRコードとアート背景を合成するユーティリティ

export async function combineQRWithArt(qrDataUrl: string, artDataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      resolve(qrDataUrl); // エラーの場合は元のQRコードを返す
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
        // 両方の画像が読み込まれたら合成開始
        composeImages();
      }
    };

    const composeImages = () => {
      // 1. アート背景を描画（透明度を下げる）
      ctx.globalAlpha = 0.3;
      ctx.drawImage(artImage, 0, 0, 1024, 1024);

      // 2. QRコードを上に重ねる
      ctx.globalAlpha = 1.0;
      ctx.drawImage(qrImage, 0, 0, 1024, 1024);

      // 3. QRコードの白い部分にアートを透過表示
      const imageData = ctx.getImageData(0, 0, 1024, 1024);
      const data = imageData.data;

      // 一時的にアート画像のデータを取得
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

      // QRコードの白い部分（明るい部分）にアートを透過表示
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // 明度を計算
        const brightness = (r + g + b) / 3;

        // 白い部分（明るい部分）にアートを透過表示
        if (brightness > 200) {
          // アート画像の対応ピクセルの色を取得
          const artR = artData[i];
          const artG = artData[i + 1];
          const artB = artData[i + 2];

          // アートの色をブレンド（控えめに）
          data[i] = Math.min(255, r * 0.7 + artR * 0.3);
          data[i + 1] = Math.min(255, g * 0.7 + artG * 0.3);
          data[i + 2] = Math.min(255, b * 0.7 + artB * 0.3);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };

    // 画像を読み込み
    qrImage.onload = onImageLoad;
    artImage.onload = onImageLoad;

    qrImage.onerror = () => resolve(qrDataUrl);
    artImage.onerror = () => resolve(qrDataUrl);

    qrImage.src = qrDataUrl;
    artImage.src = artDataUrl;
  });
}

// より簡単な合成方法（背景のみ）
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
        // 1. アート背景を薄く描画
        ctx.globalAlpha = 0.2;
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
