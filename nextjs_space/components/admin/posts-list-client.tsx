"use client";
import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Edit, Trash2, FileText, AlertTriangle, Search, Filter, ChevronLeft, ChevronRight, Send, FilePen, Copy, Check, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface PostsListClientProps {
  posts: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  categories: any[];
  tags: any[];
  authors: any[];
  filters: { search: string; status: string; categoryId: string; tagId: string; authorId: string; sortBy: string; sortOrder: string };
}

export default function PostsListClient({ posts, total, page, totalPages, categories, tags, authors, filters }: PostsListClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState(filters.search);
  const [selected, setSelected] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  const buildUrl = useCallback((params: Record<string, string>) => {
    const sp = new URLSearchParams();
    const merged = { ...filters, ...params };
    Object.entries(merged).forEach(([k, v]) => { if (v) sp.set(k, v); });
    return `/admin/posts?${sp.toString()}`;
  }, [filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildUrl({ search, page: "1" }));
  };

  const handleFilter = (key: string, value: string) => {
    router.push(buildUrl({ [key]: value, page: "1" }));
  };

  const handleSort = (col: string) => {
    const order = filters.sortBy === col && filters.sortOrder === "desc" ? "asc" : "desc";
    router.push(buildUrl({ sortBy: col, sortOrder: order, page: "1" }));
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelected((prev) => prev.length === posts.length ? [] : posts.map((p) => p.id));
  };

  const handleQuickAction = async (id: string, action: string) => {
    setActing(true);
    try {
      if (action === "delete") {
        const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
        toast.success("Đã xóa bài viết.");
      } else if (action === "publish" || action === "draft") {
        const res = await fetch(`/api/admin/posts/bulk`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: action === "publish" ? "publish" : "draft", postIds: [id] }),
        });
        if (!res.ok) throw new Error();
        toast.success(action === "publish" ? "Đã xuất bản." : "Đã chuyển về nháp.");
      }
      setShowConfirm(null);
      router.refresh();
    } catch { toast.error("Lỗi thao tác."); } finally { setActing(false); }
  };

  const handleBulkAction = async (action: string) => {
    if (!selected.length) return;
    setActing(true);
    try {
      const res = await fetch("/api/admin/posts/bulk", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, postIds: selected }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success(data.message ?? "Thành công.");
      setSelected([]); setShowBulkConfirm(null); router.refresh();
    } catch { toast.error("Lỗi thao tác hàng loạt."); } finally { setActing(false); }
  };

  const SortHeader = ({ col, label }: { col: string; label: string }) => (
    <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:text-foreground select-none" onClick={() => handleSort(col)}>
      <span className="flex items-center gap-1">
        {label}
        {filters.sortBy === col && <span className="text-primary">{filters.sortOrder === "asc" ? "↑" : "↓"}</span>}
      </span>
    </th>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Bài viết</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} bài viết</p>
        </div>
        <Link href="/admin/posts/new" className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90">
          <Plus className="w-4 h-4" /> Tạo bài viết
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-card rounded-lg shadow-sm p-4 mb-4 space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tiêu đề, slug..." className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md hover:opacity-90">Tìm</button>
          {(filters.search || filters.status || filters.categoryId || filters.tagId || filters.authorId) && (
            <button type="button" onClick={() => router.push("/admin/posts")} className="px-3 py-2 text-sm border border-input rounded-md hover:bg-muted"><X className="w-4 h-4" /></button>
          )}
        </form>
        <div className="flex flex-wrap gap-2">
          <select value={filters.status} onChange={(e) => handleFilter("status", e.target.value)} className="px-3 py-1.5 text-sm border border-input rounded-md bg-background">
            <option value="">Tất cả trạng thái</option>
            <option value="PUBLISHED">Đã xuất bản</option>
            <option value="DRAFT">Nháp</option>
          </select>
          <select value={filters.categoryId} onChange={(e) => handleFilter("categoryId", e.target.value)} className="px-3 py-1.5 text-sm border border-input rounded-md bg-background">
            <option value="">Tất cả danh mục</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filters.tagId} onChange={(e) => handleFilter("tagId", e.target.value)} className="px-3 py-1.5 text-sm border border-input rounded-md bg-background">
            <option value="">Tất cả tag</option>
            {tags.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select value={filters.authorId} onChange={(e) => handleFilter("authorId", e.target.value)} className="px-3 py-1.5 text-sm border border-input rounded-md bg-background">
            <option value="">Tất cả tác giả</option>
            {authors.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium">Đã chọn {selected.length} bài viết</span>
          <button onClick={() => handleBulkAction("publish")} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:opacity-90">
            <Send className="w-3.5 h-3.5" /> Xuất bản
          </button>
          <button onClick={() => handleBulkAction("draft")} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-yellow-600 text-white rounded-md hover:opacity-90">
            <FilePen className="w-3.5 h-3.5" /> Chuyển nháp
          </button>
          <button onClick={() => setShowBulkConfirm("delete")} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-destructive text-destructive-foreground rounded-md hover:opacity-90">
            <Trash2 className="w-3.5 h-3.5" /> Xóa
          </button>
          <button onClick={() => setSelected([])} className="text-sm text-muted-foreground hover:text-foreground ml-auto">Bỏ chọn</button>
        </div>
      )}

      {/* Table */}
      {posts.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-lg shadow-sm">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Không tìm thấy bài viết nào.</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={selected.length === posts.length && posts.length > 0} onChange={toggleAll} className="accent-primary" />
                  </th>
                  <SortHeader col="title" label="Tiêu đề" />
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase hidden sm:table-cell">Tác giả</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase hidden md:table-cell">Danh mục</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase hidden lg:table-cell">Tags</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Trạng thái</th>
                  <SortHeader col="createdAt" label="Tạo" />
                  <SortHeader col="updatedAt" label="Cập nhật" />
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {posts.map((post: any) => (
                  <tr key={post.id} className={`hover:bg-muted/30 transition-colors ${selected.includes(post.id) ? "bg-primary/5" : ""}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(post.id)} onChange={() => toggleSelect(post.id)} className="accent-primary" />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium line-clamp-1">{post.title}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{post.authorName}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{post.categoryName || "-"}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(post.tags ?? []).slice(0, 3).map((t: string, i: number) => (
                          <span key={i} className="px-1.5 py-0.5 text-xs bg-muted rounded">{t}</span>
                        ))}
                        {(post.tags?.length ?? 0) > 3 && <span className="text-xs text-muted-foreground">+{post.tags.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                        post.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {post.status === "PUBLISHED" ? "Đã xuất bản" : "Nháp"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString("vi-VN") : "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {post.updatedAt ? new Date(post.updatedAt).toLocaleDateString("vi-VN") : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {post.status === "DRAFT" ? (
                          <button onClick={() => handleQuickAction(post.id, "publish")} className="p-1.5 text-muted-foreground hover:text-green-600 rounded" title="Xuất bản"><Send className="w-4 h-4" /></button>
                        ) : (
                          <button onClick={() => handleQuickAction(post.id, "draft")} className="p-1.5 text-muted-foreground hover:text-yellow-600 rounded" title="Chuyển nháp"><FilePen className="w-4 h-4" /></button>
                        )}
                        <Link href={`/admin/posts/${post.id}/edit`} className="p-1.5 text-muted-foreground hover:text-primary rounded" title="Sửa"><Edit className="w-4 h-4" /></Link>
                        <button onClick={() => setShowConfirm(post.id)} className="p-1.5 text-muted-foreground hover:text-destructive rounded" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <span className="text-sm text-muted-foreground">Trang {page}/{totalPages}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => router.push(buildUrl({ page: String(page - 1) }))} disabled={page <= 1} className="p-1.5 rounded border border-input hover:bg-muted disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => router.push(buildUrl({ page: String(page + 1) }))} disabled={page >= totalPages} className="p-1.5 rounded border border-input hover:bg-muted disabled:opacity-30">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete single confirm */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowConfirm(null)}>
          <div className="bg-card rounded-lg shadow-lg p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-destructive/10"><AlertTriangle className="w-5 h-5 text-destructive" /></div>
              <h3 className="font-medium">Xóa bài viết</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">Bạn có chắc muốn xóa bài viết này? Tất cả ảnh liên quan sẽ bị xóa.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowConfirm(null)} className="px-3 py-1.5 text-sm border border-input rounded-md hover:bg-muted">Hủy</button>
              <button onClick={() => handleQuickAction(showConfirm, "delete")} disabled={acting} className="px-3 py-1.5 text-sm bg-destructive text-destructive-foreground rounded-md hover:opacity-90 disabled:opacity-50">
                {acting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk delete confirm */}
      {showBulkConfirm === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowBulkConfirm(null)}>
          <div className="bg-card rounded-lg shadow-lg p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-destructive/10"><AlertTriangle className="w-5 h-5 text-destructive" /></div>
              <h3 className="font-medium">Xóa {selected.length} bài viết</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">Bạn có chắc? Tất cả ảnh liên quan sẽ bị xóa.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowBulkConfirm(null)} className="px-3 py-1.5 text-sm border border-input rounded-md hover:bg-muted">Hủy</button>
              <button onClick={() => handleBulkAction("delete")} disabled={acting} className="px-3 py-1.5 text-sm bg-destructive text-destructive-foreground rounded-md hover:opacity-90 disabled:opacity-50">
                {acting ? "Đang xóa..." : "Xóa tất cả"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
