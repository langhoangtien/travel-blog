"use client";

import Link from "next/link";
import { Search, X, Menu, Plane, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "/", label: "Startseite" },
  { href: "/category", label: "Reiseziele", hasDropdown: true },
  { href: "/ueber-uns", label: "Über uns" },
  { href: "/kontakt", label: "Kontakt" },
];

interface PublicHeaderProps {
  settings?: {
    siteName?: string | null;
    siteTagline?: string | null;
    logoText?: string | null;
    showSearch?: boolean | null;
    showCategoriesInHeader?: boolean | null;
  };
}

export default function PublicHeader({ settings }: PublicHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [catDropdown, setCatDropdown] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const pathname = usePathname();

  const siteName = settings?.logoText || settings?.siteName || "Reiseblog";
  const siteTagline = settings?.siteTagline || "Reisegeschichten & Tipps";
  const showSearch = settings?.showSearch ?? true;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/public/categories")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setCategories(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!searchOpen) return;

    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  useEffect(() => {
    if (!catDropdown) return;

    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatDropdown(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [catDropdown]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setCatDropdown(false);
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  useEffect(() => {
    setMenuOpen(false);
    setCatDropdown(false);
  }, [pathname]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (searchQuery?.trim()) {
        router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
        setSearchOpen(false);
        setSearchQuery("");
      }
    },
    [searchQuery, router],
  );

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl shadow-md border-b border-border/50"
          : "bg-background/60 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Plane className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg tracking-tight leading-tight">
                {siteName}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight hidden sm:block">
                {siteTagline}
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <div
                key={link.href}
                className="relative"
                ref={link.hasDropdown ? catRef : undefined}
              >
                {link.hasDropdown ? (
                  <button
                    onClick={() => setCatDropdown(!catDropdown)}
                    className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive("/category")
                        ? "text-primary bg-primary/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {link.label}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        catDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(link.href)
                        ? "text-primary bg-primary/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                )}

                <AnimatePresence>
                  {link.hasDropdown && catDropdown && categories.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-56 bg-card rounded-xl shadow-lg border border-border/50 overflow-hidden p-1.5"
                    >
                      {categories.map((cat: any) => (
                        <Link
                          key={cat.id}
                          href={`/category/${cat.slug}`}
                          onClick={() => setCatDropdown(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-muted/70 transition-colors group"
                        >
                          <span className="w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                          <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                            {cat.name}
                          </span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            {showSearch && (
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2.5 rounded-xl transition-all ${
                  searchOpen
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
                aria-label="Suchen"
              >
                {searchOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            )}
          </div>

          <div className="flex lg:hidden items-center gap-1">
            {showSearch && (
              <button
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  setMenuOpen(false);
                }}
                className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                aria-label="Suchen"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => {
                setMenuOpen(!menuOpen);
                setSearchOpen(false);
              }}
              className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              aria-label="Menü"
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showSearch && searchOpen && (
          <motion.div
            ref={searchRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border/50 bg-card/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              <form
                onSubmit={handleSearch}
                className="flex gap-3 max-w-2xl mx-auto"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <input
                    ref={inputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Reiseziele, Tipps, Geschichten durchsuchen..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:opacity-90 transition-opacity shrink-0"
                >
                  Suchen
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-border/50 bg-card/95 backdrop-blur-xl overflow-hidden"
          >
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <div key={link.href}>
                  {link.hasDropdown ? (
                    <>
                      <button
                        onClick={() => setCatDropdown(!catDropdown)}
                        className="w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <span>{link.label}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            catDropdown ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {catDropdown && categories.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden pl-4"
                          >
                            {categories.map((cat: any) => (
                              <Link
                                key={cat.id}
                                href={`/category/${cat.slug}`}
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                {cat.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`block px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive(link.href)
                          ? "text-primary bg-primary/5"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
