"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Plane,
  FileText,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  FolderOpen,
  Tag,
  Users,
  ImageIcon,
  Settings,
  ChevronRight,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  session: any;
  settings?: {
    siteName?: string | null;
    logoText?: string | null;
    siteTagline?: string | null;
  };
}

export default function AdminLayoutClient({
  children,
  session,
  settings,
}: AdminLayoutClientProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const siteName = settings?.logoText || settings?.siteName || "Reiseblog";
  const siteTagline = settings?.siteTagline || "Admin CMS";

  const userName = session?.user?.name ?? "Admin";
  const userEmail = session?.user?.email ?? "";
  const userRole = (session?.user as any)?.role ?? "";
  const userAvatar = (session?.user as any)?.avatar ?? "";

  const navItems = [
    { href: "/admin", label: "Tổng quan", icon: LayoutDashboard, exact: true },
    { href: "/admin/posts", label: "Bài viết", icon: FileText },
    { href: "/admin/categories", label: "Danh mục", icon: FolderOpen },
    { href: "/admin/tags", label: "Tags", icon: Tag },
    { href: "/admin/media", label: "Thư viện ảnh", icon: ImageIcon },
    { href: "/admin/profile", label: "Hồ sơ cá nhân", icon: UserCircle },
    ...(userRole === "ADMIN"
      ? [
          { href: "/admin/users", label: "Tài khoản", icon: Users },
          { href: "/admin/settings", label: "Cài đặt", icon: Settings },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 h-screen bg-card border-r border-border transform transition-transform duration-300 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-16 flex items-center gap-3 px-5 border-b border-border shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Plane className="w-5 h-5 text-primary" />
          </div>

          <div className="min-w-0">
            <div className="font-display font-bold text-lg leading-tight truncate">
              {siteName}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {siteTagline}
            </div>
          </div>

          <button
            className="ml-auto lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.href
              : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary" />
                )}

                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{item.label}</span>

                {active && <ChevronRight className="w-4 h-4 opacity-70" />}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-border p-4 bg-card">
          <Link
            href="/admin/profile"
            className="block rounded-2xl bg-muted/50 p-3 mb-3 hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold overflow-hidden shrink-0">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  userName?.charAt(0)?.toUpperCase() || "A"
                )}
              </div>

              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{userName}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {userEmail}
                </div>
              </div>
            </div>

            <div className="mt-3 inline-flex text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {userRole === "ADMIN"
                ? "Quản trị viên"
                : userRole === "EDITOR"
                  ? "Biên tập viên"
                  : "Tác giả"}
            </div>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="min-h-screen flex flex-col min-w-0 lg:pl-72">
        <header className="sticky top-0 z-30 h-14 bg-card/80 backdrop-blur-xl border-b border-border px-4 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>

          <span className="font-display font-bold">{siteName} CMS</span>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
