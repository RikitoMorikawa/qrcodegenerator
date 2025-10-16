# AI QR Code Generator

## セットアップ

1. 依存関係をインストール

```bash
npm i
```

2. 環境変数を設定

- ルートに `.env.local` を作成し、`OPENAI_API_KEY` を設定

```bash
echo "OPENAI_API_KEY=sk-..." > .env.local
```

3. 開発サーバーを起動

```bash
npm run dev
```

## 機能

- QR 内容/サイズ/余白/色/背景/ドット形状/角形状の調整
- 画像ロゴのアップロード適用
- OpenAI 画像生成でロゴ自動生成（`/api/ai-image`）
- PNG/JPEG/WEBP/SVG ダウンロード

## 注意

- 画像生成は `gpt-image-1` を使用。従量課金。
- 生成画像は Data URL で返します。
# qrcodegenerator
