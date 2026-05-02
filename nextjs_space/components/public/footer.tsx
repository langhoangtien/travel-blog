import { Plane, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
  TikTokIcon,
} from "@/components/icons";
interface FooterProps {
  categories?: { id: number; name: string; slug: string }[];
  recentPosts?: { title: string; slug: string }[];
  settings?: {
    siteName?: string | null;
    logoText?: string | null;
    footerDescription?: string | null;
    locationText?: string | null;
    footerCopyright?: string | null;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    youtubeUrl?: string | null;
    tiktokUrl?: string | null;
    showFooterCategories?: boolean | null;
    showFooterRecentPosts?: boolean | null;
  };
}

export default function PublicFooter({
  categories = [],
  recentPosts = [],
  settings,
}: FooterProps) {
  const siteName = settings?.logoText || settings?.siteName || "Reiseblog";
  const footerDescription =
    settings?.footerDescription ||
    "Inspirierende Reisegeschichten, praktische Tipps und die schönsten Reiseziele — von Reisenden für Reisende.";
  const locationText = settings?.locationText || "Weltweit unterwegs";
  const footerCopyright =
    settings?.footerCopyright || "© 2026 Reiseblog. Alle Rechte vorbehalten.";

  const showFooterCategories = settings?.showFooterCategories ?? true;
  const showFooterRecentPosts = settings?.showFooterRecentPosts ?? true;

  const socialLinks = [
    {
      href: settings?.facebookUrl,
      icon: FacebookIcon,
      label: "Facebook",
    },
    {
      href: settings?.instagramUrl,
      icon: InstagramIcon,
      label: "Instagram",
    },
    {
      href: settings?.youtubeUrl,
      icon: YoutubeIcon,
      label: "YouTube",
    },
    {
      href: settings?.tiktokUrl,
      icon: TikTokIcon,
      label: "TikTok",
    },
  ].filter((x) => x.href);

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Plane className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight">
                {siteName}
              </span>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-xs">
              {footerDescription}
            </p>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{locationText}</span>
            </div>
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {socialLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <a
                      key={item.label}
                      href={item.href as string}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={item.label}
                      className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
                    >
                      <Icon className="w-4.5 h-4.5 fill-current" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-display font-bold text-sm mb-4">Navigation</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Startseite
                </Link>
              </li>
              <li>
                <Link
                  href="/ueber-uns"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Über uns
                </Link>
              </li>
              <li>
                <Link
                  href="/kontakt"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {showFooterCategories && categories.length > 0 && (
            <div>
              <h4 className="font-display font-bold text-sm mb-4">
                Kategorien
              </h4>
              <ul className="space-y-3">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/category/${cat.slug}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                    >
                      <span className="w-1 h-1 rounded-full bg-primary/40" />
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showFooterRecentPosts && recentPosts.length > 0 && (
            <div>
              <h4 className="font-display font-bold text-sm mb-4">
                Neueste Artikel
              </h4>
              <ul className="space-y-3">
                {recentPosts.map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/posts/${post.slug}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors line-clamp-1 flex items-center gap-1.5 group"
                    >
                      <ArrowRight className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="line-clamp-1">{post.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">{footerCopyright}</p>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Gemacht mit</span>
            <span className="text-red-500">♥</span>
            <span>für Reisende</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
