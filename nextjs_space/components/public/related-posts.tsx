"use client";
import Link from "next/link";
import Image from "next/image";
import { Plane, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface RelatedPost {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  authorName?: string;
  categoryName?: string | null;
}

export default function RelatedPosts({ posts }: { posts: RelatedPost[] }) {
  if (!posts?.length) return null;
  return (
    <div className="mt-14 pt-10 border-t border-border/30">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-display font-bold tracking-tight">
          Ähnliche Beiträge
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((p, i) => (
          <motion.div
            key={p.slug}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Link
              href={`/posts/${p.slug}`}
              className="group block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-border/30"
            >
              {p.coverImageUrl ? (
                <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                  <Image
                    src={p.coverImageUrl}
                    alt={p.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="aspect-[16/10] bg-muted/50 flex items-center justify-center">
                  <Plane className="w-8 h-8 text-muted-foreground/20" />
                </div>
              )}
              <div className="p-4">
                {p.categoryName && (
                  <span className="text-xs font-medium text-primary mb-1.5 block">
                    {p.categoryName}
                  </span>
                )}
                <h3 className="font-display font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {p.title}
                </h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
