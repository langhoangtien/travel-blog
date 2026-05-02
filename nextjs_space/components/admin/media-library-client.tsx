"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Loader2,
  Trash2,
  ExternalLink,
  AlertTriangle,
  ImageIcon,
  Upload,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  type: string;
  altText: string | null;
  createdAt: string;
  usedIn: { id: string; title: string; slug: string; relation: string } | null;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function MediaLibraryClient() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"" | "COVER" | "CONTENT" | "orphan">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [editAlt, setEditAlt] = useState("");
  const [savingAlt, setSavingAlt] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        search,
      });

      if (filter === "orphan") {
        params.set("orphan", "true");
      } else if (filter) {
        params.set("type", filter);
      }

      const res = await fetch(`/api/admin/media?${params.toString()}`);

      if (res.ok) {
        const data = await res.json();
        setMedia(data.media ?? []);
        setTotalPages(data.totalPages ?? 1);
        setTotal(data.total ?? 0);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, [search, filter, page]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleDelete = async (m: MediaItem) => {
    const msg = m.usedIn
      ? `Ảnh này đang dùng trong "${m.usedIn.title}". Vẫn xóa?`
      : `Xóa ảnh "${m.filename}"?`;

    if (!confirm(msg)) return;

    try {
      const res = await fetch(`/api/admin/media/${m.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      toast.success("Đã xóa ảnh.");

      if (selected === m.id) {
        setSelected(null);
        setEditAlt("");
      }

      fetchMedia();
    } catch {
      toast.error("Lỗi xóa ảnh.");
    }
  };

  const handleSaveAlt = async () => {
    if (!selected) return;

    setSavingAlt(true);

    try {
      const res = await fetch(`/api/admin/media/${selected}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ altText: editAlt }),
      });

      if (res.ok) {
        toast.success("Đã lưu alt text.");
        fetchMedia();
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Lỗi lưu alt text.");
    }

    setSavingAlt(false);
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Đã copy link ảnh.");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Không copy được link ảnh.");
    }
  };

  const handleUpload = async (file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(file.type)) {
      toast.error("Chỉ chấp nhận JPEG, PNG, WebP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh tối đa 5MB.");
      return;
    }

    setUploading(true);

    try {
      const initRes = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
          type: "CONTENT",
          postId: null,
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

        toast.success("Đã tải ảnh lên.");
        setPage(1);
        await fetchMedia();
        setSelected(data.mediaId);
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

        toast.success("Đã tải ảnh lên.");
        setPage(1);
        await fetchMedia();
        setSelected(localData.mediaId ?? data.mediaId);
        return;
      }

      throw new Error("Unknown upload mode");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi tải ảnh lên.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleUpload(file);
  };

  const selectedMedia = media.find((m) => m.id === selected);

  useEffect(() => {
    if (selectedMedia) {
      setEditAlt(selectedMedia.altText ?? "");
    }
  }, [selectedMedia]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold">Thư viện ảnh</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} ảnh</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploading ? "Đang tải..." : "Tải ảnh lên"}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm kiếm..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value as any);
            setPage(1);
          }}
          className="px-3 py-2 rounded-md border border-input bg-background text-sm"
        >
          <option value="">Tất cả</option>
          <option value="COVER">Ảnh bìa</option>
          <option value="CONTENT">Ảnh nội dung</option>
          <option value="orphan">Không sử dụng</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Không tìm thấy ảnh nào.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {media.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setSelected(m.id);
                      setEditAlt(m.altText ?? "");
                    }}
                    className={`group relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                      selected === m.id
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent hover:border-muted-foreground/30"
                    }`}
                  >
                    <Image
                      src={m.url}
                      alt={m.altText || m.filename}
                      fill
                      className="object-cover"
                    />

                    {!m.usedIn && (
                      <div className="absolute top-1 right-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 drop-shadow" />
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-[10px] truncate">
                        {m.filename}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 text-sm border rounded-md disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <span className="text-sm text-muted-foreground">
                    {page}/{totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 text-sm border rounded-md disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-card rounded-lg shadow-sm p-4 space-y-4 h-fit">
          {selectedMedia ? (
            <>
              <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                <Image
                  src={selectedMedia.url}
                  alt={selectedMedia.altText || selectedMedia.filename}
                  fill
                  className="object-contain"
                />
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-medium truncate">{selectedMedia.filename}</p>
                <p className="text-muted-foreground">
                  {formatSize(selectedMedia.size)} • {selectedMedia.mimeType}
                </p>
                <p className="text-muted-foreground">
                  {new Date(selectedMedia.createdAt).toLocaleDateString(
                    "vi-VN",
                  )}
                </p>

                {selectedMedia.usedIn ? (
                  <p className="text-xs">
                    Đang dùng:{" "}
                    <a
                      href={`/admin/posts/${selectedMedia.usedIn.id}/edit`}
                      className="text-primary hover:underline"
                    >
                      {selectedMedia.usedIn.title}
                    </a>{" "}
                    (
                    {selectedMedia.usedIn.relation === "cover"
                      ? "Ảnh bìa"
                      : "Nội dung"}
                    )
                  </p>
                ) : (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Không sử dụng
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Link ảnh</label>
                <div className="flex gap-2">
                  <input
                    value={selectedMedia.url}
                    readOnly
                    className="w-full px-2 py-1.5 rounded border border-input bg-background text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyLink(selectedMedia.url)}
                    className="px-3 py-1.5 text-xs border rounded hover:bg-muted inline-flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3" />
                        Đã copy
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Alt text</label>
                <input
                  value={editAlt}
                  onChange={(e) => setEditAlt(e.target.value)}
                  placeholder="Mô tả ảnh..."
                  className="w-full px-2 py-1.5 rounded border border-input bg-background text-sm"
                />
                <button
                  onClick={handleSaveAlt}
                  disabled={savingAlt}
                  className="w-full px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50"
                >
                  {savingAlt ? "Đang lưu..." : "Lưu alt text"}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.open(selectedMedia.url, "_blank")}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs border rounded hover:bg-muted"
                >
                  <ExternalLink className="w-3 h-3" />
                  Mở ảnh
                </button>

                <button
                  onClick={() => handleDelete(selectedMedia)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs border border-destructive text-destructive rounded hover:bg-destructive/10"
                >
                  <Trash2 className="w-3 h-3" />
                  Xóa
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Chọn ảnh để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
