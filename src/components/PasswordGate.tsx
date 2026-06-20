"use client";

import React, { useState, useTransition } from "react";
import { verifyPassword } from "@/lib/actions";

interface PasswordGateProps {
  eventSlug: string;
  onSuccess: () => void;
}

export default function PasswordGate({ eventSlug, onSuccess }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("请输入密码口令");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("password", password);
      
      const result = await verifyPassword(eventSlug, formData);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "口令验证失败");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-paper/95 backdrop-blur-xs p-4">
      <div className="max-w-md w-full bg-paper border border-mist p-8 rounded-xl shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-mist/30 flex items-center justify-center mx-auto text-ink/70 text-lg font-serif">
            信
          </div>
          <h2 className="text-2xl font-bold font-serif text-ink">入林凭信</h2>
          <p className="text-xs text-ink-light leading-relaxed">
            此为 Untitled 读书会雅集归痕处。<br />
            请输入群内发布的活动投稿口令以续良缘。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入活动投稿口令"
              disabled={isPending}
              className="w-full px-4 py-2.5 border border-mist hover:border-ink/30 focus:border-ink focus:outline-none rounded-lg bg-paper-dark/20 text-ink text-center text-sm font-medium transition duration-200"
            />
            {error && (
              <p className="text-xs text-cinnabar text-center mt-1">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 bg-ink text-paper hover:bg-cinnabar hover:text-paper font-serif font-bold text-sm rounded-lg transition duration-200 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "正在验证..." : "验信入林"}
          </button>
        </form>
      </div>
    </div>
  );
}
