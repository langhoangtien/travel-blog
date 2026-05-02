"use client";

import { useRef, useState } from "react";
import { Loader2, Save, Upload, Trash2, UserIcon } from "lucide-react";
import { toast } from "sonner";

interface ProfileUser {
  id: string;
  name: string;
  email: string;
  slug: string | null;
  bio: string | null;
  avatar: string | null;
  role: string;
  active: boolean;
}

export default function ProfileClient({ user }: { user: ProfileUser }) {
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: user.name ?? "",
    bio: user.bio ?? "",
    avatar: user.avatar ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const setField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/admin/users/avatar-upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Upload avatar thất bại.");
      }

      setField("avatar", data.url);
      toast.success("Đã upload avatar.");
    } catch (err: any) {
      toast.error(err?.message || "Upload avatar thất bại.");
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Tên không được để trống.");
      return;
    }

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Lưu hồ sơ thất bại.");
      }

      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      toast.success("Đã cập nhật hồ sơ.");
    } catch (err: any) {
      toast.error(err?.message || "Lưu hồ sơ thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Hồ sơ cá nhân</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cập nhật thông tin tài khoản, ảnh đại diện và mật khẩu.
        </p>
      </div>

      <section className="bg-card rounded-xl shadow-sm border border-border p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Avatar</label>

          <div className="rounded-xl border border-input bg-background p-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-muted border shrink-0 flex items-center justify-center">
                {form.avatar ? (
                  <img
                    src={form.avatar}
                    alt="Avatar"
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
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      await handleAvatarUpload(file);
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
                        <Upload className="w-4 h-4" />
                        {form.avatar ? "Đổi ảnh" : "Tải ảnh"}
                      </>
                    )}
                  </button>

                  {form.avatar && (
                    <button
                      type="button"
                      onClick={() => setField("avatar", "")}
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

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tên hiển thị</label>
            <input
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <input
              value={user.email}
              disabled
              className="w-full px-3 py-2 rounded-md border border-input bg-muted text-sm text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Email đăng nhập không thể đổi tại đây.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tiểu sử</label>
            <textarea
              value={form.bio}
              onChange={(e) => setField("bio", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
        </div>
      </section>

      <section className="bg-card rounded-xl shadow-sm border border-border p-6 space-y-4">
        <div>
          <h2 className="text-lg font-display font-bold">Đổi mật khẩu</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Để trống nếu không muốn đổi mật khẩu.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <input
            type="password"
            value={form.currentPassword}
            onChange={(e) => setField("currentPassword", e.target.value)}
            placeholder="Mật khẩu hiện tại"
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />

          <input
            type="password"
            value={form.newPassword}
            onChange={(e) => setField("newPassword", e.target.value)}
            placeholder="Mật khẩu mới"
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />

          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setField("confirmPassword", e.target.value)}
            placeholder="Xác nhận mật khẩu mới"
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </section>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}
