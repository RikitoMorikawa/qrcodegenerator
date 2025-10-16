"use client";

import React, { useTransition } from "react";
import { useQrStyle } from "@/context/qrStyle";

export default function Controls() {
  const { state, setState } = useQrStyle();
  const [isPending, startTransition] = useTransition();

  const onChange = <K extends keyof typeof state>(key: K, value: (typeof state)[K]) => {
    startTransition(() => setState((s) => ({ ...s, [key]: value })));
  };

  return (
    <div className="grid gap-6">
      <div className="space-y-3">
        <label className="block text-sm font-medium">URL</label>
        <input className="input" value={state.text} onChange={(e) => onChange("text", e.target.value)} placeholder="https://..." />
      </div>

      <div className="space-y-3">
        <AIImageGenerator />
      </div>
    </div>
  );
}

function AIImageGenerator() {
  const { setState } = useQrStyle();
  const [isPending, startTransition] = useTransition();

  const handleGenerate = async (formData: FormData) => {
    const prompt = String(formData.get("prompt") || "").trim();
    if (!prompt) return;
    startTransition(async () => {
      const res = await fetch("/api/ai-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        const err = await safeJson(res);
        alert(`AI生成に失敗しました: ${err?.error || res.statusText}`);
        return;
      }
      const json = (await res.json()) as { dataUrl: string };
      setState((s) => ({ ...s, logoDataUrl: json.dataUrl }));
    });
  };

  return (
    <form action={handleGenerate} className="space-y-3">
      <label className="block text-sm font-medium">AIロゴ生成（OpenAI）</label>
      <input name="prompt" className="input" placeholder="例: フラットな猫ロゴ、青系" />
      <button type="submit" className="btn btn-primary" disabled={isPending}>
        {isPending ? "生成中..." : "生成してロゴに適用"}
      </button>
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
