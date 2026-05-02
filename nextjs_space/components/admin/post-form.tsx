"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import TiptapEditor from "./tiptap-editor";
import TagInput from "./tag-input";
import SEOChecklist from "./seo-checklist";
import MediaPickerModal from "./media-picker-modal";
import {
  Save,
  Send,
  ArrowLeft,
  ImagePlus,
  X,
  Loader2,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface TagOption {
  id: string;
  name: string;
  slug: string;
}

interface PostFormProps {
  mode: "create" | "edit";
  post?: any;
  categories: any[];
  authors: any[];
  currentUserId: string;
  allTags?: TagOption[];
}

function slugify(text: string): string {
  return (text ?? "")
    .toLowerCase()
    .replace(/[ä]/g, "ae")
    .replace(/[ö]/g, "oe")
    .replace(/[ü]/g, "ue")
    .replace(/[ß]/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function PostForm({
  mode,
  post,
  categories,
  authors,
  currentUserId,
  allTags = [],
}: PostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [categoryId, setCategoryId] = useState(post?.categoryId ?? "");
  const [authorId, setAuthorId] = useState(
    post?.authorId ?? currentUserId ?? "",
  );
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    post?.metaDescription ?? "",
  );
  const [status, setStatus] = useState<string>(post?.status ?? "DRAFT");
  const [coverImageUrl, setCoverImageUrl] = useState(
    post?.coverImage?.url ?? "",
  );
  const [coverMediaId, setCoverMediaId] = useState(post?.coverImageId ?? "");
  const [saving, setSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(!post);
  const [selectedTags, setSelectedTags] = useState<TagOption[]>(
    (post?.tags ?? []).map((pt: any) => ({
      id: pt.tag?.id ?? pt.id,
      name: pt.tag?.name ?? pt.name,
      slug: pt.tag?.slug ?? pt.slug,
    })),
  );
  const [dirty, setDirty] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<
    "editor" | "cover"
  >("editor");
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const postIdRef = useRef(post?.id ?? null);
  const editorInsertMediaRef = useRef<
    ((media: { id: string; url: string }) => void) | null
  >(null);
  const [showSEO, setShowSEO] = useState(false);

  useEffect(() => {
    if (autoSlug && title) setSlug(slugify(title));
  }, [title, autoSlug]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  useEffect(() => {
    if (!dirty || status === "PUBLISHED") return;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(async () => {
      if (!title?.trim()) return;

      setAutoSaveStatus("saving");

      try {
        const payload = {
          title,
          slug: slug || slugify(title),
          excerpt,
          content,
          categoryId: categoryId || null,
          authorId,
          metaTitle,
          metaDescription,
          status: "DRAFT",
          coverImageId: coverMediaId || null,
          tagIds: selectedTags.map((t) => t.id),
        };

        if (postIdRef.current) {
          await fetch(`/api/admin/posts/${postIdRef.current}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } else {
          const res = await fetch("/api/admin/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            const data = await res.json();
            postIdRef.current = data.id;
          }
        }

        setAutoSaveStatus("saved");
        setDirty(false);
        setTimeout(() => setAutoSaveStatus("idle"), 3000);
      } catch {
        setAutoSaveStatus("idle");
      }
    }, 30000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [
    dirty,
    title,
    slug,
    excerpt,
    content,
    categoryId,
    authorId,
    metaTitle,
    metaDescription,
    coverMediaId,
    selectedTags,
    status,
  ]);

  const markDirty = useCallback(() => setDirty(true), []);

  const handleCoverUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e?.target?.files?.[0];
      if (!file) return;

      const allowed = ["image/jpeg", "image/png", "image/webp"];

      if (!allowed.includes(file.type)) {
        toast.error("Chỉ chấp nhận JPEG, PNG, WebP.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ảnh tối đa 5MB.");
        return;
      }

      try {
        const initRes = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            fileSize: file.size,
            type: "COVER",
            postId: postIdRef.current,
          }),
        });

        if (!initRes.ok) throw new Error("Init upload failed");

        const data = await initRes.json();

        if (data.mode === "S3") {
          const headers: Record<string, string> = {
            "Content-Type": file.type,
          };

          if (data.uploadUrl?.includes("content-disposition")) {
            headers["Content-Disposition"] = "attachment";
          }

          const uploadRes = await fetch(data.uploadUrl, {
            method: "PUT",
            headers,
            body: file,
          });

          if (!uploadRes.ok) throw new Error("S3 upload failed");

          await fetch("/api/admin/upload/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cloud_storage_path: data.cloud_storage_path,
              mediaId: data.mediaId,
            }),
          });

          setCoverImageUrl(data.url);
          setCoverMediaId(data.mediaId);
          setDirty(true);
          toast.success("Đã tải ảnh bìa lên.");
          return;
        }

        if (data.mode === "LOCAL") {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("mediaId", data.mediaId);

          const localRes = await fetch("/api/admin/upload/local", {
            method: "POST",
            body: formData,
          });

          if (!localRes.ok) throw new Error("Local upload failed");

          const localData = await localRes.json();

          setCoverImageUrl(localData.url);
          setCoverMediaId(localData.mediaId);
          setDirty(true);
          toast.success("Đã tải ảnh bìa lên.");
          return;
        }

        throw new Error("Unknown upload mode");
      } catch (err) {
        console.error(err);
        toast.error("Lỗi tải ảnh bìa.");
      }
    },
    [],
  );

  const handleSave = async (targetStatus?: string) => {
    const finalStatus = targetStatus ?? status;

    if (!title?.trim()) {
      toast.error("Tiêu đề không được để trống.");
      return;
    }

    if (!slug?.trim()) {
      toast.error("Slug không được để trống.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title,
        slug,
        excerpt,
        content,
        categoryId: categoryId || null,
        authorId,
        metaTitle,
        metaDescription,
        status: finalStatus,
        coverImageId: coverMediaId || null,
        tagIds: selectedTags.map((t) => t.id),
      };

      const isEdit = mode === "edit" || postIdRef.current;
      const url = isEdit
        ? `/api/admin/posts/${postIdRef.current ?? post?.id}`
        : "/api/admin/posts";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Lỗi lưu bài viết");
      }

      setDirty(false);
      toast.success(
        finalStatus === "PUBLISHED" ? "Đã xuất bản bài viết!" : "Đã lưu nháp!",
      );
      router.replace("/admin/posts");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Lỗi lưu bài viết.");
    } finally {
      setSaving(false);
    }
  };

  const openMediaPicker = (target: "editor" | "cover") => {
    setMediaPickerTarget(target);
    setShowMediaPicker(true);
  };

  const handleMediaSelect = (media: { id: string; url: string }) => {
    if (mediaPickerTarget === "cover") {
      setCoverImageUrl(media.url);
      setCoverMediaId(media.id);
      setDirty(true);
      return;
    }

    if (mediaPickerTarget === "editor") {
      editorInsertMediaRef.current?.(media);
      setDirty(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            if (dirty && !confirm("Bạn có thay đổi chưa lưu. Thoát?")) {
              return;
            }
            router.push("/admin/posts");
          }}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        <div className="flex items-center gap-2">
          {autoSaveStatus === "saving" && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3 animate-spin" /> Đang lưu...
            </span>
          )}

          {autoSaveStatus === "saved" && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="w-3 h-3" /> Đã lưu
            </span>
          )}

          <button
            onClick={() => handleSave("DRAFT")}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-sm border border-input rounded-md hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Lưu nháp
          </button>

          <button
            onClick={() => handleSave("PUBLISHED")}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Xuất bản
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-6">
          <div className="bg-card rounded-lg shadow-sm p-6 space-y-5">
            <h1 className="text-xl font-display font-bold">
              {mode === "create" ? "Tạo bài viết mới" : "Sửa bài viết"}
            </h1>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Tiêu đề <span className="text-destructive">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  markDirty();
                }}
                placeholder="Nhập tiêu đề bài viết"
                className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Slug <span className="text-destructive">*</span>
              </label>
              <input
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setAutoSlug(false);
                  markDirty();
                }}
                placeholder="duong-dan-bai-viet"
                className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Mô tả ngắn</label>
              <textarea
                value={excerpt}
                onChange={(e) => {
                  setExcerpt(e.target.value);
                  markDirty();
                }}
                placeholder="Tóm tắt nội dung bài viết..."
                rows={3}
                className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nội dung</label>
              <TiptapEditor
                content={content}
                onChange={(html) => {
                  setContent(html);
                  markDirty();
                }}
                postId={postIdRef.current ?? post?.id ?? null}
                onDirty={markDirty}
                onPickMedia={() => openMediaPicker("editor")}
                onReadyPickMedia={(handler) => {
                  editorInsertMediaRef.current = handler;
                }}
              />
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm">
            <button
              type="button"
              onClick={() => setShowSEO(!showSEO)}
              className="w-full text-left px-6 py-4 text-sm font-medium hover:bg-muted/30 transition-colors flex items-center justify-between"
            >
              Cài đặt SEO
              <span className="text-xs text-muted-foreground">
                {showSEO ? "▲" : "▼"}
              </span>
            </button>

            {showSEO && (
              <div className="p-6 space-y-4 border-t border-input">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Meta Title</label>
                  <input
                    value={metaTitle}
                    onChange={(e) => {
                      setMetaTitle(e.target.value);
                      markDirty();
                    }}
                    placeholder="Tiêu đề SEO"
                    className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <p className="text-xs text-muted-foreground">
                    {(metaTitle || title || "").length}/60 ký tự
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Meta Description
                  </label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => {
                      setMetaDescription(e.target.value);
                      markDirty();
                    }}
                    placeholder="Mô tả SEO"
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {(metaDescription || excerpt || "").length}/160 ký tự
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-lg shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-display font-bold">Trạng thái</h3>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="DRAFT"
                  checked={status === "DRAFT"}
                  onChange={() => {
                    setStatus("DRAFT");
                    markDirty();
                  }}
                  className="accent-primary"
                />
                Nháp
              </label>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="PUBLISHED"
                  checked={status === "PUBLISHED"}
                  onChange={() => {
                    setStatus("PUBLISHED");
                    markDirty();
                  }}
                  className="accent-primary"
                />
                Xuất bản
              </label>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-display font-bold">Ảnh bìa</h3>

            {coverImageUrl ? (
              <div className="relative aspect-video w-full rounded-md overflow-hidden bg-muted">
                <Image
                  src={coverImageUrl}
                  alt="Ảnh bìa bài viết"
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => {
                    setCoverImageUrl("");
                    setCoverMediaId("");
                    markDirty();
                  }}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-input rounded-md p-6 cursor-pointer hover:border-primary/50 transition-colors">
                  <ImagePlus className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Tải ảnh lên
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => openMediaPicker("cover")}
                  className="w-full text-center text-xs text-primary hover:underline"
                >
                  Hoặc chọn từ thư viện
                </button>
              </div>
            )}
          </div>

          <div className="bg-card rounded-lg shadow-sm p-4 space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tác giả</label>
              <select
                value={authorId}
                onChange={(e) => {
                  setAuthorId(e.target.value);
                  markDirty();
                }}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {(authors ?? []).map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Danh mục</label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  markDirty();
                }}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">-- Chọn danh mục --</option>
                {(categories ?? []).map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-4 space-y-3">
            <h3 className="text-sm font-display font-bold">Tags</h3>
            <TagInput
              allTags={allTags}
              selectedTags={selectedTags}
              onChange={(tags) => {
                setSelectedTags(tags);
                markDirty();
              }}
            />
          </div>

          <SEOChecklist
            title={title}
            slug={slug}
            metaTitle={metaTitle}
            metaDescription={metaDescription}
            content={content}
            excerpt={excerpt}
            coverImageUrl={coverImageUrl}
          />
        </div>
      </div>

      <MediaPickerModal
        open={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
