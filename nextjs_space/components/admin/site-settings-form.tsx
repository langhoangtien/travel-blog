"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SiteSettingsForm({
  initialData,
}: {
  initialData: any;
}) {
  const [form, setForm] = useState(initialData);
  const [saving, setSaving] = useState(false);

  const setField = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Lưu cài đặt thất bại.");
      }

      const data = await res.json();
      setForm(data);
      toast.success("Đã lưu cài đặt website.");
    } catch (err: any) {
      toast.error(err?.message || "Lưu cài đặt thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Cài đặt website</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Lưu
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-card rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-display font-bold">Thông tin chung</h2>

          <input
            value={form.siteName || ""}
            onChange={(e) => setField("siteName", e.target.value)}
            placeholder="Tên website"
            className="w-full px-3 py-2 border rounded-md bg-background"
          />

          <input
            value={form.logoText || ""}
            onChange={(e) => setField("logoText", e.target.value)}
            placeholder="Text logo"
            className="w-full px-3 py-2 border rounded-md bg-background"
          />

          <input
            value={form.siteTagline || ""}
            onChange={(e) => setField("siteTagline", e.target.value)}
            placeholder="Tagline"
            className="w-full px-3 py-2 border rounded-md bg-background"
          />

          <textarea
            value={form.siteDescription || ""}
            onChange={(e) => setField("siteDescription", e.target.value)}
            placeholder="Mô tả website"
            rows={3}
            className="w-full px-3 py-2 border rounded-md bg-background"
          />

          <input
            value={form.siteUrl || ""}
            onChange={(e) => setField("siteUrl", e.target.value)}
            placeholder="https://yourdomain.com"
            className="w-full px-3 py-2 border rounded-md bg-background"
          />

          <input
            value={form.contactEmail || ""}
            onChange={(e) => setField("contactEmail", e.target.value)}
            placeholder="Email liên hệ"
            className="w-full px-3 py-2 border rounded-md bg-background"
          />

          <input
            value={form.contactPhone || ""}
            onChange={(e) => setField("contactPhone", e.target.value)}
            placeholder="Số điện thoại"
            className="w-full px-3 py-2 border rounded-md bg-background"
          />

          <input
            value={form.locationText || ""}
            onChange={(e) => setField("locationText", e.target.value)}
            placeholder="Vị trí / địa điểm"
            className="w-full px-3 py-2 border rounded-md bg-background"
          />
        </section>

        <section className="bg-card rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-display font-bold">Branding</h2>

          <input
            value={form.logoImageUrl || ""}
            onChange={(e) => setField("logoImageUrl", e.target.value)}
            placeholder="Logo image URL"
            className="w-full px-3 py-2 border rounded-md bg-background"
          />

          <input
            value={form.faviconUrl || ""}
            onChange={(e) => setField("faviconUrl", e.target.value)}
            placeholder="Favicon URL"
            className="w-full px-3 py-2 border rounded-md bg-background"
          />

          <input
            value={form.defaultOgImageUrl || ""}
            onChange={(e) => setField("defaultOgImageUrl", e.target.value)}
            placeholder="Default OG image URL"
            className="w-full px-3 py-2 border rounded-md bg-background"
          />

          <select
            value={form.primaryColor || "sky-blue"}
            onChange={(e) => setField("primaryColor", e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="sky-blue">Sky Blue</option>
            <option value="ocean-teal">Ocean Teal</option>
            <option value="violet">Violet</option>
          </select>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form.showSearch}
                onChange={(e) => setField("showSearch", e.target.checked)}
              />
              Hiển thị ô tìm kiếm ở header
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form.showCategoriesInHeader}
                onChange={(e) =>
                  setField("showCategoriesInHeader", e.target.checked)
                }
              />
              Hiển thị danh mục ở header
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form.showFooterCategories}
                onChange={(e) =>
                  setField("showFooterCategories", e.target.checked)
                }
              />
              Hiển thị danh mục ở footer
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form.showFooterRecentPosts}
                onChange={(e) =>
                  setField("showFooterRecentPosts", e.target.checked)
                }
              />
              Hiển thị bài mới ở footer
            </label>
          </div>
        </section>

        <section className="bg-card rounded-lg shadow-sm p-6 space-y-4 lg:col-span-2">
          <h2 className="text-lg font-display font-bold">Homepage</h2>

          <input
            value={form.heroTitle || ""}
            onChange={(e) => setField("heroTitle", e.target.value)}
            placeholder="Hero title"
            className="w-full px-3 py-2 border rounded-md bg-background"
          />

          <textarea
            value={form.heroSubtitle || ""}
            onChange={(e) => setField("heroSubtitle", e.target.value)}
            placeholder="Hero subtitle"
            rows={3}
            className="w-full px-3 py-2 border rounded-md bg-background"
          />

          <input
            value={form.heroImageUrl || ""}
            onChange={(e) => setField("heroImageUrl", e.target.value)}
            placeholder="Hero image URL"
            className="w-full px-3 py-2 border rounded-md bg-background"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={form.heroPrimaryCtaText || ""}
              onChange={(e) => setField("heroPrimaryCtaText", e.target.value)}
              placeholder="Primary CTA text"
              className="w-full px-3 py-2 border rounded-md bg-background"
            />
            <input
              value={form.heroPrimaryCtaHref || ""}
              onChange={(e) => setField("heroPrimaryCtaHref", e.target.value)}
              placeholder="Primary CTA href"
              className="w-full px-3 py-2 border rounded-md bg-background"
            />
            <input
              value={form.heroSecondaryCtaText || ""}
              onChange={(e) => setField("heroSecondaryCtaText", e.target.value)}
              placeholder="Secondary CTA text"
              className="w-full px-3 py-2 border rounded-md bg-background"
            />
            <input
              value={form.heroSecondaryCtaHref || ""}
              onChange={(e) => setField("heroSecondaryCtaHref", e.target.value)}
              placeholder="Secondary CTA href"
              className="w-full px-3 py-2 border rounded-md bg-background"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              ["showHeroSection", "Hero"],
              ["showFeaturedSection", "Featured"],
              ["showCategorySection", "Categories"],
              ["showPopularSection", "Popular"],
              ["showNewsletterSection", "Newsletter"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!form[key]}
                  onChange={(e) => setField(key, e.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Số bài nổi bật</label>
              <p className="text-xs text-muted-foreground">
                Số bài hiển thị ở mục “Ausgewählte Beiträge”.
              </p>
              <input
                type="number"
                min={1}
                max={12}
                value={form.featuredPostsCount ?? 3}
                onChange={(e) =>
                  setField("featuredPostsCount", Number(e.target.value))
                }
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Số bài mới nhất</label>
              <p className="text-xs text-muted-foreground">
                Số bài hiển thị ở mục “Neueste Artikel”.
              </p>
              <input
                type="number"
                min={1}
                max={24}
                value={form.latestPostsCount ?? 6}
                onChange={(e) =>
                  setField("latestPostsCount", Number(e.target.value))
                }
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Số bài phổ biến</label>
              <p className="text-xs text-muted-foreground">
                Số bài hiển thị ở sidebar “Beliebt”.
              </p>
              <input
                type="number"
                min={1}
                max={12}
                value={form.popularPostsCount ?? 5}
                onChange={(e) =>
                  setField("popularPostsCount", Number(e.target.value))
                }
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
          </div>
        </section>

        <section className="bg-card rounded-lg shadow-sm p-6 space-y-4 lg:col-span-2">
          <h2 className="text-lg font-display font-bold">Footer & Social</h2>

          <textarea
            value={form.footerDescription || ""}
            onChange={(e) => setField("footerDescription", e.target.value)}
            placeholder="Footer description"
            rows={3}
            className="w-full px-3 py-2 border rounded-md bg-background"
          />

          <input
            value={form.footerCopyright || ""}
            onChange={(e) => setField("footerCopyright", e.target.value)}
            placeholder="Footer copyright"
            className="w-full px-3 py-2 border rounded-md bg-background"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={form.facebookUrl || ""}
              onChange={(e) => setField("facebookUrl", e.target.value)}
              placeholder="Facebook URL"
              className="w-full px-3 py-2 border rounded-md bg-background"
            />
            <input
              value={form.instagramUrl || ""}
              onChange={(e) => setField("instagramUrl", e.target.value)}
              placeholder="Instagram URL"
              className="w-full px-3 py-2 border rounded-md bg-background"
            />
            <input
              value={form.youtubeUrl || ""}
              onChange={(e) => setField("youtubeUrl", e.target.value)}
              placeholder="YouTube URL"
              className="w-full px-3 py-2 border rounded-md bg-background"
            />
            <input
              value={form.tiktokUrl || ""}
              onChange={(e) => setField("tiktokUrl", e.target.value)}
              placeholder="TikTok URL"
              className="w-full px-3 py-2 border rounded-md bg-background"
            />
          </div>
        </section>
        <section className="bg-card rounded-lg shadow-sm p-6 space-y-4 lg:col-span-2">
          <h2 className="text-lg font-display font-bold">Tối ưu ảnh upload</h2>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!form.enableImageOptimization}
              onChange={(e) =>
                setField("enableImageOptimization", e.target.checked)
              }
            />
            Bật tối ưu ảnh tự động khi upload
          </label>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ảnh nội dung</label>

              <select
                value={form.contentImageMaxWidth ?? 1600}
                onChange={(e) =>
                  setField("contentImageMaxWidth", Number(e.target.value))
                }
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value={800}>800 px</option>
                <option value={1200}>1200 px</option>
                <option value={1600}>1600 px</option>
                <option value={1920}>1920 px</option>
                <option value={2560}>2560 px</option>
              </select>

              <select
                value={form.contentImageQuality ?? 80}
                onChange={(e) =>
                  setField("contentImageQuality", Number(e.target.value))
                }
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value={70}>Quality 70</option>
                <option value={80}>Quality 80</option>
                <option value={90}>Quality 90</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ảnh bìa</label>

              <select
                value={form.coverImageMaxWidth ?? 1920}
                onChange={(e) =>
                  setField("coverImageMaxWidth", Number(e.target.value))
                }
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value={1600}>1600 px</option>
                <option value={1920}>1920 px</option>
                <option value={2560}>2560 px</option>
              </select>

              <select
                value={form.coverImageQuality ?? 82}
                onChange={(e) =>
                  setField("coverImageQuality", Number(e.target.value))
                }
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value={75}>Quality 75</option>
                <option value={82}>Quality 82</option>
                <option value={90}>Quality 90</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Avatar</label>

              <select
                value={form.avatarImageMaxWidth ?? 400}
                onChange={(e) =>
                  setField("avatarImageMaxWidth", Number(e.target.value))
                }
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value={200}>200 px</option>
                <option value={400}>400 px</option>
                <option value={600}>600 px</option>
              </select>

              <select
                value={form.avatarImageQuality ?? 80}
                onChange={(e) =>
                  setField("avatarImageQuality", Number(e.target.value))
                }
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value={70}>Quality 70</option>
                <option value={80}>Quality 80</option>
                <option value={90}>Quality 90</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Định dạng</label>

              <select
                value={form.imageFormat ?? "webp"}
                onChange={(e) => setField("imageFormat", e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="webp">WEBP</option>
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
              </select>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Ảnh sẽ được resize theo loại upload và convert theo định dạng đã
            chọn.
          </p>
        </section>
      </div>
    </div>
  );
}
