"use client";
import { FileText, Send, FilePen, FolderOpen, Tag, Users, ImageIcon, Clock } from "lucide-react";
import Link from "next/link";

interface DashboardData {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalCategories: number;
  totalTags: number;
  totalAuthors: number;
  totalMedia: number;
  recentPosts: any[];
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  const stats = [
    { label: "Tổng bài viết", value: data.totalPosts, icon: FileText, color: "text-blue-600 bg-blue-50" },
    { label: "Đã xuất bản", value: data.publishedPosts, icon: Send, color: "text-green-600 bg-green-50" },
    { label: "Bản nháp", value: data.draftPosts, icon: FilePen, color: "text-yellow-600 bg-yellow-50" },
    { label: "Danh mục", value: data.totalCategories, icon: FolderOpen, color: "text-purple-600 bg-purple-50" },
    { label: "Tags", value: data.totalTags, icon: Tag, color: "text-orange-600 bg-orange-50" },
    { label: "Tác giả", value: data.totalAuthors, icon: Users, color: "text-indigo-600 bg-indigo-50" },
    { label: "Ảnh", value: data.totalMedia, icon: ImageIcon, color: "text-pink-600 bg-pink-50" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold tracking-tight">Tổng quan</h1>
        <p className="text-sm text-muted-foreground mt-1">Thống kê tổng quan hệ thống blog</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-card rounded-lg shadow-sm">
        <div className="flex items-center gap-2 p-4 border-b border-border">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-medium">Cập nhật gần đây</h2>
        </div>
        {data.recentPosts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Chưa có bài viết nào.</div>
        ) : (
          <div className="divide-y divide-border">
            {data.recentPosts.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/posts/${p.id}/edit`} className="text-sm font-medium hover:text-primary transition-colors line-clamp-1">{p.title}</Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{p.authorName}</span>
                    {p.categoryName && <span className="text-xs text-muted-foreground">· {p.categoryName}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                    p.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {p.status === "PUBLISHED" ? "Đã xuất bản" : "Nháp"}
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString("vi-VN") : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
