import { z } from "zod";

export const SUBMISSION_TYPES = ["poetry", "food", "painting", "fashion", "music", "other"] as const;

export const submissionSchema = z.object({
  authorName: z
    .string()
    .min(1, "请输入您的名字或昵称")
    .max(50, "名字或昵称过长"),
  type: z.enum(SUBMISSION_TYPES, {
    errorMap: () => ({ message: "请选择作品类型" }),
  }),
  title: z
    .string()
    .min(1, "请输入作品标题")
    .max(100, "标题过长"),
  contentText: z.string().optional(),
  mediaUrl: z.string().url("媒体链接格式不正确").optional().or(z.literal("")),
  mediaType: z.string().optional(),
  note: z.string().max(300, "感言字数请在300字以内").optional(),
});

export const passwordSchema = z.object({
  password: z.string().min(1, "请输入口令"),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;
export type PasswordInput = z.infer<typeof passwordSchema>;
