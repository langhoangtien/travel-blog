"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, FolderOpen, X, AlertTriangle, Save } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string; name: string; slug: string; description: string | null; postCount: number; createdAt: string;
}

export default function CategoriesClient({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => { setEditId(null); setName(""); setDescription(""); setShowForm(true); };
  const openEdit = (c: Category) => { setEditId(c.id); setName(c.name); setDescription(c.description ?? ""); setShowForm(true); };

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Tên danh mục không được để trống."); return; }
    setSaving(true);
    try {
      const url = editId ? `/api/admin/categories/${editId}` : "/api/admin/categories";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description }) });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error ?? "Lỗi lưu danh mục"); }
      toast.success(editId ? "Đã cập nhật danh mục." : "Đã tạo danh mục mới.");
      setShowForm(false); router.refresh();
    } catch (err: any) { toast.error(err?.message ?? "Lỗi."); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error ?? "Lỗi xóa"); }
      toast.success("Đã xóa danh mục."); setDeleteId(null); router.refresh();
    } catch (err: any) { toast.error(err?.message ?? "Lỗi."); } finally { setDeleting(false); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Danh mục</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý danh mục bài viết</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90">
          <Plus className="w-4 h-4" /> Tạo danh mục
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-lg shadow-sm">
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Chưa có danh mục nào.</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Tên</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase hidden sm:table-cell">Slug</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase text-center">Bài viết</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium">{c.name}</span>
                    {c.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{c.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-mono hidden sm:table-cell">{c.slug}</td>
                  <td className="px-4 py-3 text-sm text-center">{c.postCount}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-muted-foreground hover:text-primary rounded" title="Sửa"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(c.id)} className="p-1.5 text-muted-foreground hover:text-destructive rounded" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-lg shadow-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold">{editId ? "Sửa danh mục" : "Tạo danh mục"}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tên danh mục <span className="text-destructive">*</span></label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: Städtereisen" className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Mô tả</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả ngắn về danh mục..." rows={2} className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowForm(false)} className="px-3 py-2 text-sm border border-input rounded-md hover:bg-muted">Hủy</button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50">
                  <Save className="w-4 h-4" /> {saving ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteId(null)}>
          <div className="bg-card rounded-lg shadow-lg p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-destructive/10"><AlertTriangle className="w-5 h-5 text-destructive" /></div>
              <h3 className="font-medium">Xóa danh mục</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">Bạn có chắc muốn xóa danh mục này? Không thể xóa nếu đang có bài viết.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)} className="px-3 py-1.5 text-sm border border-input rounded-md hover:bg-muted">Hủy</button>
              <button onClick={() => handleDelete(deleteId)} disabled={deleting} className="px-3 py-1.5 text-sm bg-destructive text-destructive-foreground rounded-md hover:opacity-90 disabled:opacity-50">
                {deleting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
