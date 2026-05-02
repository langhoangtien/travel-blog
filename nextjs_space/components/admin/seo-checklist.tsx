"use client";
import { useMemo } from "react";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface SEOChecklistProps {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  excerpt: string;
  coverImageUrl: string;
}

interface CheckItem {
  label: string;
  status: "pass" | "warn" | "fail";
  hint: string;
}

function stripHtml(html: string): string {
  return (html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function countHeadings(html: string): { h1: number; h2: number; h3: number } {
  const h1 = ((html ?? "").match(/<h1[^>]*>/gi) ?? []).length;
  const h2 = ((html ?? "").match(/<h2[^>]*>/gi) ?? []).length;
  const h3 = ((html ?? "").match(/<h3[^>]*>/gi) ?? []).length;
  return { h1, h2, h3 };
}

function countImages(html: string): number {
  return ((html ?? "").match(/<img[^>]*>/gi) ?? []).length;
}

function countInternalLinks(html: string): number {
  const links = (html ?? "").match(/<a[^>]*href=["'][^"']*["'][^>]*>/gi) ?? [];
  return links.filter((l) => !l.includes("http") || l.includes("reiseblog") || l.includes("localhost")).length;
}

export default function SEOChecklist({ title, slug, metaTitle, metaDescription, content, excerpt, coverImageUrl }: SEOChecklistProps) {
  const checks = useMemo(() => {
    const items: CheckItem[] = [];
    const effectiveTitle = metaTitle || title;
    const titleLen = (effectiveTitle ?? "").length;
    items.push({
      label: `Ti\u00eau \u0111\u1ec1 SEO (${titleLen} k\u00fd t\u1ef1)`,
      status: titleLen >= 30 && titleLen <= 60 ? "pass" : titleLen > 0 && titleLen < 30 ? "warn" : titleLen > 60 ? "warn" : "fail",
      hint: titleLen === 0 ? "Ch\u01b0a c\u00f3 ti\u00eau \u0111\u1ec1" : titleLen < 30 ? "N\u00ean d\u00e0i 30-60 k\u00fd t\u1ef1" : titleLen > 60 ? "Qu\u00e1 d\u00e0i, n\u00ean d\u01b0\u1edbi 60" : "T\u1ed1t!",
    });

    const descLen = (metaDescription || excerpt || "").length;
    items.push({
      label: `M\u00f4 t\u1ea3 SEO (${descLen} k\u00fd t\u1ef1)`,
      status: descLen >= 120 && descLen <= 160 ? "pass" : descLen > 0 && descLen < 120 ? "warn" : descLen > 160 ? "warn" : "fail",
      hint: descLen === 0 ? "Ch\u01b0a c\u00f3 m\u00f4 t\u1ea3" : descLen < 120 ? "N\u00ean 120-160 k\u00fd t\u1ef1" : descLen > 160 ? "Qu\u00e1 d\u00e0i" : "T\u1ed1t!",
    });

    const slugOk = /^[a-z0-9-]+$/.test(slug ?? "") && (slug ?? "").length > 3;
    items.push({
      label: "Slug URL",
      status: slugOk ? "pass" : slug ? "warn" : "fail",
      hint: !slug ? "Ch\u01b0a c\u00f3 slug" : !slugOk ? "N\u00ean d\u00f9ng ch\u1eef th\u01b0\u1eddng, s\u1ed1, g\u1ea1ch ngang" : "T\u1ed1t!",
    });

    const headings = countHeadings(content);
    const hasGoodStructure = headings.h2 >= 1;
    items.push({
      label: `C\u1ea5u tr\u00fac heading (H2: ${headings.h2}, H3: ${headings.h3})`,
      status: hasGoodStructure ? "pass" : headings.h2 === 0 && headings.h3 === 0 ? "fail" : "warn",
      hint: !hasGoodStructure ? "C\u1ea7n \u00edt nh\u1ea5t 1 H2" : "T\u1ed1t!",
    });

    const imgCount = countImages(content);
    items.push({
      label: `H\u00ecnh \u1ea3nh trong n\u1ed9i dung (${imgCount})`,
      status: imgCount >= 1 ? "pass" : "warn",
      hint: imgCount === 0 ? "N\u00ean th\u00eam \u1ea3nh minh h\u1ecda" : "T\u1ed1t!",
    });

    items.push({
      label: "\u1ea2nh b\u00eca",
      status: coverImageUrl ? "pass" : "warn",
      hint: coverImageUrl ? "T\u1ed1t!" : "N\u00ean th\u00eam \u1ea3nh b\u00eca",
    });

    const internalLinks = countInternalLinks(content);
    items.push({
      label: `Li\u00ean k\u1ebft n\u1ed9i b\u1ed9 (${internalLinks})`,
      status: internalLinks >= 1 ? "pass" : "warn",
      hint: internalLinks === 0 ? "N\u00ean th\u00eam link n\u1ed9i b\u1ed9" : "T\u1ed1t!",
    });

    const textLen = stripHtml(content).length;
    items.push({
      label: `\u0110\u1ed9 d\u00e0i n\u1ed9i dung (~${Math.round(textLen / 5)} t\u1eeb)`,
      status: textLen >= 1500 ? "pass" : textLen >= 500 ? "warn" : "fail",
      hint: textLen < 500 ? "Qu\u00e1 ng\u1eafn, n\u00ean >300 t\u1eeb" : textLen < 1500 ? "N\u00ean d\u00e0i h\u01a1n" : "T\u1ed1t!",
    });

    return items;
  }, [title, slug, metaTitle, metaDescription, content, excerpt, coverImageUrl]);

  const passCount = checks.filter((c) => c.status === "pass").length;
  const total = checks.length;
  const score = Math.round((passCount / total) * 100);

  return (
    <div className="bg-card rounded-lg shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-display font-bold">Ki\u1ec3m tra SEO</h3>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${score >= 75 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : score >= 50 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
          {score}%
        </span>
      </div>
      <div className="space-y-1.5">
        {checks.map((c, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            {c.status === "pass" ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" /> : c.status === "warn" ? <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />}
            <div>
              <span className="font-medium">{c.label}</span>
              <span className="text-muted-foreground ml-1">{c.hint}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
