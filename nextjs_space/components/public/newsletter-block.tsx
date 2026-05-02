"use client";
import { useState } from "react";
import { Mail, Loader2, CheckCircle2, Send } from "lucide-react";

export default function NewsletterBlock() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSuccess(true);
        setEmail("");
      } else {
        const data = await res.json();
        setError(data.error || "Fehler");
      }
    } catch {
      setError("Verbindungsfehler.");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
        <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
        <p className="font-display font-bold text-lg">Vielen Dank f\u00fcr Ihre Anmeldung!</p>
        <p className="text-sm text-muted-foreground mt-2">Sie erhalten bald unsere neuesten Reiseberichte.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-2xl p-6 sm:p-8 border border-border/30">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Mail className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-display font-bold text-lg">Newsletter</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
        Erhalten Sie die neuesten Reiseberichte und Tipps direkt in Ihr Postfach.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ihre E-Mail-Adresse"
          required
          className="flex-1 px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        />
        <button type="submit" disabled={loading} className="px-5 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 shrink-0">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Anmelden</>}
        </button>
      </form>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </div>
  );
}
