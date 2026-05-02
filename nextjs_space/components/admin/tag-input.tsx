"use client";
import { useState, useRef, useEffect } from "react";
import { X, Plus } from "lucide-react";

interface TagOption { id: string; name: string; slug: string; }
interface TagInputProps {
  allTags: TagOption[];
  selectedTags: TagOption[];
  onChange: (tags: TagOption[]) => void;
}

export default function TagInput({ allTags, selectedTags, onChange }: TagInputProps) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [creating, setCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = (allTags ?? []).filter((t) =>
    !selectedTags.some((s) => s.id === t.id) &&
    t.name.toLowerCase().includes(query.toLowerCase())
  );

  const exactMatch = (allTags ?? []).some((t) => t.name.toLowerCase() === query.trim().toLowerCase()) ||
    selectedTags.some((t) => t.name.toLowerCase() === query.trim().toLowerCase());

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const addTag = (tag: TagOption) => {
    onChange([...selectedTags, tag]);
    setQuery("");
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const removeTag = (id: string) => {
    onChange(selectedTags.filter((t) => t.id !== id));
  };

  const createTag = async () => {
    if (!query.trim() || exactMatch) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: query.trim() }),
      });
      if (res.ok) {
        const tag = await res.json();
        addTag({ id: tag.id, name: tag.name, slug: tag.slug });
      }
    } catch { /* ignore */ }
    setCreating(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length > 0) {
        addTag(filtered[0]);
      } else if (query.trim() && !exactMatch) {
        createTag();
      }
    }
    if (e.key === "Backspace" && !query && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1].id);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-md border border-input bg-background min-h-[42px] focus-within:ring-2 focus-within:ring-ring">
        {selectedTags.map((t) => (
          <span key={t.id} className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-sm rounded-full">
            {t.name}
            <button type="button" onClick={() => removeTag(t.id)} className="hover:text-destructive">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length === 0 ? "Thêm tag..." : ""}
          className="flex-1 min-w-[100px] text-sm bg-transparent outline-none"
        />
      </div>

      {showDropdown && (query || filtered.length > 0) && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((t) => (
            <button key={t.id} type="button" onClick={() => addTag(t)} className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors">
              {t.name}
            </button>
          ))}
          {query.trim() && !exactMatch && (
            <button type="button" onClick={createTag} disabled={creating} className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-primary/5 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Tạo tag "{query.trim()}"
            </button>
          )}
          {filtered.length === 0 && exactMatch && (
            <div className="px-3 py-2 text-sm text-muted-foreground">Không có tag phù hợp.</div>
          )}
        </div>
      )}
    </div>
  );
}
