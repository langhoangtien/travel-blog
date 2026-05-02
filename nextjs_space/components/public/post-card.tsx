"use client";
import Link from "next/link";
import Image from "next/image";
import { Calendar, User, ArrowRight, FolderOpen, Plane } from "lucide-react";
import { motion } from "framer-motion";

interface PostCardProps {
  post: {
    slug: string;
    title: string;
    excerpt: string | null;
    coverImageUrl: string | null;
    authorName: string;
    categoryName: string | null;
    categorySlug?: string | null;
    publishedAt: string;
    viewCount?: number;
  };
  index?: number;
  variant?: "default" | "featured" | "horizontal";
}

export default function PostCard({ post, index = 0, variant = "default" }: PostCardProps) {
  const date = post?.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("de-DE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  if (variant === "horizontal") {
    return (
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.08 }}
      >
        <Link href={`/posts/${post?.slug ?? ""}`} className="flex gap-4 group">
          {post?.coverImageUrl ? (
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-muted shrink-0">
              <Image
                src={post.coverImageUrl}
                alt={post?.title ?? "Blogbeitrag"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
              <Plane className="w-8 h-8 text-muted-foreground/30" />
            </div>
          )}
          <div className="flex-1 min-w-0 py-1">
            {post?.categoryName && (
              <span className="text-xs font-medium text-primary mb-1 block">{post.categoryName}</span>
            )}
            <h3 className="font-display font-semibold text-sm sm:text-base tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
              {post?.title ?? ""}
            </h3>
            {date && (
              <span className="text-xs text-muted-foreground mt-1.5 block">{date}</span>
            )}
          </div>
        </Link>
      </motion.article>
    );
  }

  if (variant === "featured") {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group relative rounded-2xl overflow-hidden"
      >
        <Link href={`/posts/${post?.slug ?? ""}`} className="block">
          <div className="relative aspect-[4/5] sm:aspect-[3/4] bg-muted">
            {post?.coverImageUrl ? (
              <Image
                src={post.coverImageUrl}
                alt={post?.title ?? "Blogbeitrag"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Plane className="w-16 h-16 text-muted-foreground/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
              {post?.categoryName && (
                <span className="inline-block px-2.5 py-1 bg-primary/90 text-primary-foreground text-xs font-medium rounded-lg mb-3">
                  {post.categoryName}
                </span>
              )}
              <h2 className="text-white font-display font-bold text-lg sm:text-xl tracking-tight line-clamp-2 mb-2">
                {post?.title ?? ""}
              </h2>
              <div className="flex items-center gap-3 text-white/70 text-xs">
                {date && <span>{date}</span>}
                {post?.authorName && (
                  <><span>•</span><span>{post.authorName}</span></>
                )}
              </div>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="bg-card rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-border/30"
    >
      <Link href={`/posts/${post?.slug ?? ""}`}>
        {post?.coverImageUrl ? (
          <div className="relative aspect-[16/10] bg-muted overflow-hidden">
            <Image
              src={post.coverImageUrl}
              alt={post?.title ?? "Blogbeitrag"}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        ) : (
          <div className="aspect-[16/10] bg-muted/50 flex items-center justify-center">
            <Plane className="w-12 h-12 text-muted-foreground/20" />
          </div>
        )}
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            {post?.categoryName && post?.categorySlug && (
              <span className="font-medium text-primary">{post.categoryName}</span>
            )}
            {date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />{date}
              </span>
            )}
          </div>
          <h2 className="text-lg font-display font-bold tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {post?.title ?? ""}
          </h2>
          {post?.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{post.excerpt}</p>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="w-3.5 h-3.5" />{post?.authorName ?? ""}
            </span>
            <span className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
              Lesen <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
