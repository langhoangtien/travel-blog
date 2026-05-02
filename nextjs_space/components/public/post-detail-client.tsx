"use client";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  User,
  FolderOpen,
  Tag,
  Clock,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";

interface TagInfo {
  name: string;
  slug: string;
}

interface PostDetailClientProps {
  post: {
    title: string;
    content: string | null;
    excerpt: string | null;
    coverImageUrl: string | null;
    authorName: string;
    authorSlug: string | null;
    authorAvatar: string | null;
    authorBio: string | null;
    categoryName: string | null;
    categorySlug: string | null;
    publishedAt: string;
    tags: TagInfo[];
    readingTime: number;
    slug: string;
    prevPost?: { slug: string; title: string } | null;
    nextPost?: { slug: string; title: string } | null;
  };
}

function extractTOC(
  html: string,
): { id: string; text: string; level: number }[] {
  const toc: { id: string; text: string; level: number }[] = [];
  const regex = /<h([2-3])[^>]*>(.*?)<\/h[2-3]>/gi;
  let match;
  while ((match = regex.exec(html ?? "")) !== null) {
    const level = parseInt(match[1]);
    const text = match[2].replace(/<[^>]*>/g, "").trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/(^-|-$)/g, "");
    toc.push({ id, text, level });
  }
  return toc;
}

function addIdsToHeadings(html: string): string {
  return (html ?? "").replace(
    /<h([2-3])([^>]*)>(.*?)<\/h([2-3])>/gi,
    (match, level, attrs, text) => {
      const plainText = text.replace(/<[^>]*>/g, "").trim();
      const id = plainText
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/(^-|-$)/g, "");
      return `<h${level}${attrs} id="${id}">${text}</h${level}>`;
    },
  );
}

export default function PostDetailClient({ post }: PostDetailClientProps) {
  const date = post?.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("de-DE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  // Track view
  useEffect(() => {
    if (post?.slug) {
      fetch(`/api/posts/${post.slug}/view`, { method: "POST" }).catch(() => {});
    }
  }, [post?.slug]);

  const toc = useMemo(() => extractTOC(post?.content ?? ""), [post?.content]);
  const contentWithIds = useMemo(
    () => addIdsToHeadings(post?.content ?? ""),
    [post?.content],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const blocks = document.querySelectorAll(".article-content pre");

      blocks.forEach((pre) => {
        if (pre.querySelector(".copy-code-btn")) return;

        const btn = document.createElement("button");
        btn.innerText = "Copy";
        btn.className = "copy-code-btn";

        btn.onclick = async () => {
          const code =
            pre.querySelector("code")?.textContent || pre.textContent || "";

          try {
            await navigator.clipboard.writeText(code);
            btn.innerText = "Copied";
            setTimeout(() => {
              btn.innerText = "Copy";
            }, 1600);
          } catch {
            btn.innerText = "Failed";
          }
        };

        pre.appendChild(btn);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [contentWithIds]);
  return (
    <main className="flex-1">
      {/* Hero Cover */}
      {post?.coverImageUrl && (
        <div className="relative w-full h-[40vh] md:h-[50vh] max-h-[500px] bg-muted">
          <Image
            src={post.coverImageUrl}
            alt={post?.title ?? "Blogbeitrag"}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>
      )}

      <article className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Breadcrumb */}
          <nav
            className={`flex items-center gap-1.5 text-xs ${post?.coverImageUrl ? "text-white/80" : "text-muted-foreground"} mb-6 flex-wrap`}
          >
            <Link href="/" className="hover:text-primary transition-colors">
              Startseite
            </Link>
            {post?.categoryName && post?.categorySlug && (
              <>
                <span>/</span>
                <Link
                  href={`/category/${post.categorySlug}`}
                  className="hover:text-primary transition-colors"
                >
                  {post.categoryName}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="truncate max-w-[200px]">{post?.title}</span>
          </nav>

          {/* Card wrapper for content */}
          <div className="bg-card rounded-2xl shadow-lg border border-border/20 overflow-hidden">
            <div className="p-6 sm:p-8 md:p-10">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-5">
                {post?.categoryName && post?.categorySlug && (
                  <Link
                    href={`/category/${post.categorySlug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <FolderOpen className="w-3 h-3" /> {post.categoryName}
                  </Link>
                )}
                {date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {date}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {post.readingTime} Min.
                  Lesezeit
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-[2.5rem] font-display font-bold tracking-tight mb-8 leading-tight">
                {post?.title ?? ""}
              </h1>

              {/* Table of Contents */}
              {toc.length >= 3 && (
                <details
                  open
                  className="bg-muted/40 rounded-xl p-5 mb-8 border border-border/30"
                >
                  <summary className="font-display font-semibold text-sm cursor-pointer">
                    Inhaltsverzeichnis
                  </summary>
                  <nav className="mt-3 space-y-1.5">
                    {toc.map((item, i) => (
                      <a
                        key={i}
                        href={`#${item.id}`}
                        className={`block text-sm text-muted-foreground hover:text-primary transition-colors ${item.level === 3 ? "pl-5" : ""}`}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </details>
              )}

              {/* Content */}
              <div
                className="article-content prose prose-lg max-w-none prose-headings:font-display prose-headings:tracking-tight prose-a:text-primary prose-img:rounded-xl prose-blockquote:border-primary/30 prose-blockquote:bg-muted/30 prose-blockquote:rounded-r-xl prose-blockquote:py-1"
                dangerouslySetInnerHTML={{ __html: contentWithIds }}
              />

              {/* Tags */}
              {post?.tags && post.tags.length > 0 && (
                <div className="mt-10 pt-6 border-t border-border/30">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    {post.tags.map((t) => (
                      <Link
                        key={t.slug}
                        href={`/tag/${t.slug}`}
                        className="px-3 py-1.5 bg-muted text-xs font-medium rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {t.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Box */}
              <div className="mt-10 pt-8 border-t border-border/30">
                <Link
                  href={post?.authorSlug ? `/autor/${post.authorSlug}` : "#"}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                    {post?.authorAvatar ? (
                      <Image
                        src={post.authorAvatar}
                        alt={post?.authorName ?? "Autor"}
                        width={56}
                        height={56}
                        className="rounded-2xl object-cover"
                      />
                    ) : (
                      <User className="w-7 h-7 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Geschrieben von
                    </p>
                    <p className="font-display font-bold group-hover:text-primary transition-colors">
                      {post?.authorName ?? ""}
                    </p>
                    {post?.authorBio && (
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                        {post.authorBio}
                      </p>
                    )}
                  </div>
                </Link>
              </div>

              {/* Next/Prev Navigation */}
              {(post?.prevPost || post?.nextPost) && (
                <div className="mt-10 pt-8 border-t border-border/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {post.prevPost ? (
                      <Link
                        href={`/posts/${post.prevPost.slug}`}
                        className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors group"
                      >
                        <ChevronLeft className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0 group-hover:text-primary transition-colors" />
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Vorheriger Beitrag
                          </p>
                          <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                            {post.prevPost.title}
                          </p>
                        </div>
                      </Link>
                    ) : (
                      <div />
                    )}
                    {post.nextPost ? (
                      <Link
                        href={`/posts/${post.nextPost.slug}`}
                        className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors group text-right sm:flex-row-reverse"
                      >
                        <ChevronRight className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0 group-hover:text-primary transition-colors" />
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Nächster Beitrag
                          </p>
                          <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                            {post.nextPost.title}
                          </p>
                        </div>
                      </Link>
                    ) : (
                      <div />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </article>
    </main>
  );
}
