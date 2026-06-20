"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import { createSubmission } from "@/lib/actions";
import { SUBMISSION_TYPES } from "@/lib/validators";
import { typeLabelMap } from "./TypeFilter";

interface SubmissionFormProps {
  eventId: string;
  eventSlug: string;
}

// Server-side upload avoids CORS issues with client-side blob token exchange
const MAX_UPLOAD_SIZE_BYTES = 4 * 1024 * 1024; // 4MB (Vercel serverless body limit)

export default function SubmissionForm({ eventId, eventSlug }: SubmissionFormProps) {
  const router = useRouter();

  // Form states
  const [authorName, setAuthorName] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<typeof SUBMISSION_TYPES[number]>("poetry");
  const [contentText, setContentText] = useState("");
  const [note, setNote] = useState("");

  // File states
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isBusy = isUploading || isSubmitting;

  const getUploadErrorMessage = (err: unknown): string => {
    const rawMessage = err instanceof Error ? err.message : String(err);
    const normalized = rawMessage.toUpperCase();

    if (normalized.includes("AUTH_EXPIRED") || normalized.includes("UNAUTHORIZED")) {
      return "口令已过期，请刷新页面后重新验证口令";
    }
    if (normalized.includes("UNSUPPORTED_FILE_TYPE")) {
      return "当前文件格式不支持，请更换为常见图片或音频格式";
    }
    if (normalized.includes("FILE_TOO_LARGE")) {
      return "文件太大，请压缩后重试（上限 4MB）";
    }
    return "媒体文件上传失败，请重试";
  };

  const uploadFile = async (selectedFile: File): Promise<{ url: string }> => {
    const body = new FormData();
    body.append("file", selectedFile);
    body.append("eventSlug", eventSlug);

    const response = await fetch("/api/upload", {
      method: "POST",
      body,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.code || "Upload failed");
    }

    return { url: data.url };
  };

  const getSubmitButtonLabel = () => {
    if (isUploading) return "正在上传媒体...";
    if (isSubmitting) return "正在录存...";
    return "处理中...";
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError(null);
    setUploadProgress(null);

    // Validate size and compress if image
    if (selectedFile.type.startsWith("image/")) {
      try {
        setUploadProgress("正在压缩图片...");
        const options = {
          maxSizeMB: 1.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(selectedFile, options);
        setFile(compressedFile);
        setFilePreview(URL.createObjectURL(compressedFile));
        setUploadProgress("图片压缩完成");
      } catch (err) {
        console.error("Image compression error:", err);
        setFile(selectedFile);
        setFilePreview(URL.createObjectURL(selectedFile));
        setUploadProgress(null);
      }
    } else {
      // Audio or video or other files (limit to 10MB)
      if (selectedFile.size > MAX_UPLOAD_SIZE_BYTES) {
        setError("媒体文件不能超过 4MB");
        return;
      }
      setFile(selectedFile);
      setFilePreview(null);
    }
  };

  const handleTypeChange = (newType: typeof SUBMISSION_TYPES[number]) => {
    setType(newType);
    setFile(null);
    setFilePreview(null);
    setUploadProgress(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUploadProgress(null);

    if (!authorName.trim()) {
      setError("请输入您的名字或昵称");
      return;
    }
    if (!title.trim()) {
      setError("请输入作品标题");
      return;
    }

    let mediaUrl = "";
    let mediaType = "";

    // 1. Upload file if needed
    if (file) {
      try {
        setIsUploading(true);
        setUploadProgress("正在上传媒体文件...");
        const result = await uploadFile(file);
        mediaUrl = result.url;
        mediaType = file.type;
      } catch (err) {
        console.error("Upload error:", err);
        setError(getUploadErrorMessage(err));
        setUploadProgress(null);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    try {
      setIsSubmitting(true);
      setUploadProgress("正在保存作品数据...");

      // 2. Submit to DB via Server Action
      const result = await createSubmission(eventSlug, eventId, {
        authorName,
        title,
        type,
        contentText: contentText.trim() || undefined,
        mediaUrl: mediaUrl || undefined,
        mediaType: mediaType || undefined,
        note: note.trim() || undefined,
      });

      if (result.success) {
        setUploadProgress("提交成功！正在跳转...");
        router.push(`/events/${eventSlug}`);
        router.refresh();
      } else {
        setError(result.error || "提交作品出错，请重试");
        setUploadProgress(null);
      }
    } catch (err) {
      console.error("Submission save error:", err);
      setError("提交作品出错，请重试");
      setUploadProgress(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto bg-paper border border-mist p-8 rounded-xl shadow-xs">
      <div className="text-center pb-2 border-b border-mist/40">
        <h2 className="text-xl font-bold font-serif text-ink">分享我的美</h2>
        <p className="text-xs text-ink-light mt-1">
          将您的雅作录于此处，供众友同赏。
        </p>
      </div>

      {error && (
        <div className="p-3 text-xs bg-cinnabar/5 border border-cinnabar/20 text-cinnabar rounded-lg text-center">
          {error}
        </div>
      )}

      {/* Author Name */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-ink">
          您的名字 / 昵称 <span className="text-cinnabar">*</span>
        </label>
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="名余曰正则兮..."
          disabled={isBusy}
          required
          className="w-full px-4 py-2 border border-mist hover:border-ink/25 focus:border-ink focus:outline-none rounded-lg bg-paper-dark/10 text-ink text-sm transition duration-200"
        />
      </div>

      {/* Submission Title */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-ink">
          作品标题 <span className="text-cinnabar">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="如：《九歌·国殇》 / 端午香粽"
          disabled={isBusy}
          required
          className="w-full px-4 py-2 border border-mist hover:border-ink/25 focus:border-ink focus:outline-none rounded-lg bg-paper-dark/10 text-ink text-sm transition duration-200"
        />
      </div>

      {/* Submission Type */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-ink">作品类别</label>
        <div className="grid grid-cols-3 gap-2">
          {SUBMISSION_TYPES.map((t) => {
            const isSelected = type === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                disabled={isBusy}
                className={`py-2 px-3 border rounded-lg text-xs font-medium text-center transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-ink border-ink text-paper"
                    : "border-mist text-ink-light bg-paper-dark/10 hover:border-ink/25"
                }`}
              >
                {typeLabelMap[t]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Media file upload field if type requires file */}
      {["food", "painting", "fashion", "music", "other"].includes(type) && (
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-ink">
            {type === "music" ? "音频文件 (mp3/wav/m4a)" : "作品图片"}
          </label>
          <div className="relative border-2 border-dashed border-mist hover:border-ink/30 rounded-lg p-4 transition-colors duration-200 bg-paper-dark/15 flex flex-col items-center justify-center">
            <input
              type="file"
              accept={type === "music" ? "audio/*" : "image/*"}
              onChange={handleFileChange}
              disabled={isBusy}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-center space-y-1 select-none pointer-events-none">
              <svg className="w-8 h-8 text-ink-light mx-auto mb-1 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
              </svg>
              <p className="text-xs text-ink-light font-medium">
                {file ? file.name : `选择并上传${type === "music" ? "音频" : "图片"}`}
              </p>
              <p className="text-[10px] text-ink-light/70">
                {type === "music" ? "不超过 10MB" : "图片大小自动压缩"}
              </p>
            </div>
          </div>

          {filePreview && (
            <div className="mt-3 relative rounded-lg border border-mist overflow-hidden aspect-video bg-paper-dark/20 max-w-xs mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={filePreview}
                alt="Upload preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      )}

      {/* Content Text (Mandatory for poetry, optional for others) */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-ink">
          作品内容 {type === "poetry" && <span className="text-cinnabar">*</span>}
        </label>
        <textarea
          rows={type === "poetry" ? 6 : 4}
          value={contentText}
          onChange={(e) => setContentText(e.target.value)}
          placeholder={
            type === "poetry"
              ? "长太息以掩涕兮，哀民生之多艰。..."
              : "输入作品的文字介绍、故事或补充说明（可选）"
          }
          disabled={isBusy}
          required={type === "poetry"}
          className="w-full px-4 py-2 border border-mist hover:border-ink/25 focus:border-ink focus:outline-none rounded-lg bg-paper-dark/10 text-ink text-sm transition duration-200 resize-none font-serif leading-relaxed"
        />
      </div>

      {/* Note / 感言 */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-ink">
          一句话感想 <span className="text-ink-light">(选填)</span>
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="朝饮木兰之坠露兮，夕餐秋菊之落英。"
          disabled={isBusy}
          className="w-full px-4 py-2 border border-mist hover:border-ink/25 focus:border-ink focus:outline-none rounded-lg bg-paper-dark/10 text-ink text-sm transition duration-200"
        />
      </div>

      {/* Submitting progress */}
      {uploadProgress && (
        <p className="text-xs text-orchid text-center font-medium animate-pulse">
          {uploadProgress}
        </p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isBusy}
        className="w-full py-3 bg-cinnabar text-paper hover:bg-cinnabar-light font-serif font-bold text-sm rounded-lg transition duration-200 disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
      >
        {isBusy ? (
          <>
            <svg className="animate-spin h-4 w-4 text-paper" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{getSubmitButtonLabel()}</span>
          </>
        ) : (
          <span>录存留痕</span>
        )}
      </button>
    </form>
  );
}
