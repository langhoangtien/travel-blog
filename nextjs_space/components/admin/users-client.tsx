"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  X,
  Shield,
  UserIcon,
} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  slug: string | null;
  bio: string | null;
  avatar: string | null;
  _count?: { posts: number };
}

export default function UsersClient({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "AUTHOR",
    bio: "",
    active: true,
    avatar: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const fetchUsers = useCallback(async () => {
    console.log("USERS1");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();

        setUsers(data ?? []);
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    console.log("FFFd");

    fetchUsers();
  }, [fetchUsers]);

  const openCreate = () => {
    setEditUser(null);
    setForm({
      name: "",
      email: "",
      password: "",
      role: "AUTHOR",
      bio: "",
      active: true,
      avatar: "",
    });
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      bio: u.bio ?? "",
      active: u.active,
      avatar: u.avatar ?? "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Tên và email bắt buộc.");
      return;
    }
    if (!editUser && !form.password) {
      toast.error("Mật khẩu bắt buộc khi tạo mới.");
      return;
    }
    setSaving(true);
    try {
      const url = editUser
        ? `/api/admin/users/${editUser.id}`
        : "/api/admin/users";
      const method = editUser ? "PUT" : "POST";
      const payload: any = {
        name: form.name,
        email: form.email,
        role: form.role,
        bio: form.bio || null,
        active: form.active,
        avatar: form.avatar || null,
      };
      if (form.password) payload.password = form.password;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Lỗi");
      }
      toast.success(
        editUser ? "Đã cập nhật người dùng!" : "Đã tạo người dùng!",
      );
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.message ?? "Lỗi");
    }
    setSaving(false);
  };

  const handleDelete = async (u: User) => {
    if (u.id === currentUserId) {
      toast.error("Không thể xóa chính mình.");
      return;
    }
    if (!confirm(`Xóa người dùng "${u.name}"? Bài viết sẽ không bị xóa.`))
      return;
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? "Lỗi");
      }
      toast.success("Đã xóa người dùng.");
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.message ?? "Lỗi");
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Quản lý người dùng</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Thêm người dùng
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm..."
          className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Tên</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Vai trò</th>
                <th className="text-center px-4 py-3 font-medium">Bài viết</th>
                <th className="text-center px-4 py-3 font-medium">
                  Trạng thái
                </th>
                <th className="text-right px-4 py-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Không có người dùng nào.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-full h-full object-cover"
                            />
                          ) : u.role === "ADMIN" ? (
                            <Shield className="w-4 h-4 text-primary" />
                          ) : (
                            <UserIcon className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <span className="font-medium">{u.name}</span>
                        {u.id === currentUserId && (
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            (bạn)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {u.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${u.role === "ADMIN" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"}`}
                      >
                        {u.role === "ADMIN" ? "Admin" : "Tác giả"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {u._count?.posts ?? 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${u.active ? "bg-green-500" : "bg-gray-400"}`}
                        title={u.active ? "Hoạt động" : "Vô hiệu"}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                          title="Sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {u.id !== currentUserId && (
                          <button
                            onClick={() => handleDelete(u)}
                            className="p-1.5 text-muted-foreground hover:text-destructive rounded hover:bg-muted"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-display font-bold mb-4">
              {editUser ? "Sửa người dùng" : "Thêm người dùng"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Avatar</label>

                <div className="rounded-xl border border-input bg-background p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted border shrink-0 flex items-center justify-center">
                      {form.avatar ? (
                        <img
                          src={form.avatar}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <p className="text-sm font-medium">Ảnh đại diện</p>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG, WEBP. Ảnh sẽ được tối ưu tự động.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            setUploadingAvatar(true);

                            try {
                              const fd = new FormData();
                              fd.append("file", file);

                              const res = await fetch(
                                "/api/admin/users/avatar-upload",
                                {
                                  method: "POST",
                                  body: fd,
                                },
                              );

                              const data = await res.json();

                              if (res.ok) {
                                setForm((prev) => ({
                                  ...prev,
                                  avatar: data.url,
                                }));
                                toast.success("Đã upload avatar.");
                              } else {
                                toast.error(data.error || "Upload lỗi.");
                              }
                            } catch {
                              toast.error("Upload lỗi.");
                            } finally {
                              setUploadingAvatar(false);
                              if (avatarInputRef.current) {
                                avatarInputRef.current.value = "";
                              }
                            }
                          }}
                        />

                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          disabled={uploadingAvatar}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-input hover:bg-muted disabled:opacity-50"
                        >
                          {uploadingAvatar ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Đang tải...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              {form.avatar ? "Đổi ảnh" : "Tải ảnh"}
                            </>
                          )}
                        </button>

                        {form.avatar && (
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                avatar: "",
                              }))
                            }
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                            Xóa avatar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Tên <span className="text-destructive">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  {editUser
                    ? "Mật khẩu mới (để trống nếu không đổi)"
                    : "Mật khẩu"}{" "}
                  {!editUser && <span className="text-destructive">*</span>}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Vai trò</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="AUTHOR">Tác giả</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Trạng thái</label>
                  <select
                    value={form.active ? "active" : "inactive"}
                    onChange={(e) =>
                      setForm({ ...form, active: e.target.value === "active" })
                    }
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Vô hiệu</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tiểu sử</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm border border-input rounded-md hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editUser ? "Cập nhật" : "Tạo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
