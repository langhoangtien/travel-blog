"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Tag as TagIcon, X, AlertTriangle, Save } from "lucide-react";
import { toast } from "sonner";

interface TagItem { id: string; name: string; slug: string; postCount: number; createdAt: string; }

export default function TagsClient({ tags }: { tags: TagItem[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => { setEditId(null); setName(""); setShowForm(true); };
  const openEdit = (t: TagItem) => { setEditId(t.id); setName(t.name); setShowForm(true); };

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Tên tag không được để trống."); return; }
    setSaving(true);
    try {
      const url = editId ? `/api/admin/tags/${editId}` : "/api/admin/tags";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error ?? "Lỗi"); }
      toast.success(editId ? "Đã cập nhật tag." : "Đã tạo tag mới.");
      setShowForm(false); router.refresh();
    } catch (err: any) { toast.error(err?.message ?? "Lỗi."); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/tags/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Lỗi xóa");
      toast.success("Đã xóa tag."); setDeleteId(null); router.refresh();
    } catch (err: any) { toast.error(err?.message ?? "Lỗi."); } finally { setDeleting(false); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Tags</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý tags bài viết</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90">
          <Plus className="w-4 h-4" /> Tạo tag
        </button>
      </div>

      {tags.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-lg shadow-sm">
          <TagIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Chưa có tag nào.</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-sm">
          <div className="flex flex-wrap gap-2 p-4">
            {tags.map((t) => (
              <div key={t.id} className="group flex items-center gap-2 px-3 py-2 rounded-full border border-input hover:border-primary/50 transition-colors">
                <TagIcon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">{t.name}</span>
                <span className="text-xs text-muted-foreground">({t.postCount})</span>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(t)} className="p-0.5 text-muted-foreground hover:text-primary"><Edit className="w-3 h-3" /></button>
                  <button onClick={() => setDeleteId(t.id)} className="p-0.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-lg shadow-lg p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold">{editId ? "Sửa tag" : "Tạo tag"}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tên tag <span className="text-destructive">*</span></label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: Barcelona" className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" onKeyDown={(e) => e.key === "Enter" && handleSave()} />
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

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteId(null)}>
          <div className="bg-card rounded-lg shadow-lg p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-destructive/10"><AlertTriangle className="w-5 h-5 text-destructive" /></div>
              <h3 className="font-medium">Xóa tag</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">Bạn có chắc muốn xóa tag này?</p>
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
