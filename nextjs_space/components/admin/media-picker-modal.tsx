"use client";
import { useState, useEffect, useCallback } from "react";
import { X, Search, Loader2, Check } from "lucide-react";
import Image from "next/image";

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
  altText: string | null;
}

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (media: { id: string; url: string }) => void;
}

export default function MediaPickerModal({
  open,
  onClose,
  onSelect,
}: MediaPickerModalProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{ id: string; url: string } | null>(
    null,
  );

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/media?search=${encodeURIComponent(search)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media ?? []);
      }
    } catch {}
    setLoading(false);
  }, [search]);

  useEffect(() => {
    if (open) {
      fetchMedia();
      setSelected(null);
    }
  }, [open, fetchMedia]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-display font-bold">Thư viện ảnh</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm ảnh..."
              className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : media.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Không tìm thấy ảnh nào.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {media.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelected({ id: m.id, url: m.url })}
                  className={`relative aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                    selected?.id === m.id
                      ? "border-primary"
                      : "border-transparent hover:border-muted-foreground/30"
                  }`}
                >
                  <Image
                    src={m.url}
                    alt={m.altText || m.filename}
                    fill
                    className="object-cover"
                  />
                  {selected?.id === m.id && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check className="w-6 h-6 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-input rounded-md hover:bg-muted"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              if (selected) {
                onSelect(selected);
                onClose();
              }
            }}
            disabled={!selected}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
          >
            Chọn ảnh
          </button>
        </div>
      </div>
    </div>
  );
}
