"use client";
import { useState } from "react";
import { Loader2, CheckCircle2, Send } from "lucide-react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Bitte geben Sie Ihren Namen ein.";
    if (!form.email.trim()) errs.email = "Bitte geben Sie Ihre E-Mail-Adresse ein.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Bitte geben Sie eine g\u00fcltige E-Mail-Adresse ein.";
    if (!form.subject.trim()) errs.subject = "Bitte geben Sie einen Betreff ein.";
    if (!form.message.trim()) errs.message = "Bitte geben Sie eine Nachricht ein.";
    else if (form.message.trim().length < 10) errs.message = "Die Nachricht muss mindestens 10 Zeichen lang sein.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || "Ein Fehler ist aufgetreten.");
      }
    } catch {
      setError("Verbindungsfehler. Bitte versuchen Sie es sp\u00e4ter erneut.");
    }
    setLoading(false);
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="font-display font-bold text-xl mb-2">Nachricht gesendet!</h3>
        <p className="text-muted-foreground">Vielen Dank f\u00fcr Ihre Nachricht. Wir melden uns schnellstm\u00f6glich bei Ihnen.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">Name *</label>
          <input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Ihr Name"
            className={`w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all ${
              errors.name ? "border-destructive" : "border-input"
            }`}
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">E-Mail *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="ihre@email.de"
            className={`w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all ${
              errors.email ? "border-destructive" : "border-input"
            }`}
          />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Betreff *</label>
        <input
          value={form.subject}
          onChange={(e) => handleChange("subject", e.target.value)}
          placeholder="Worum geht es?"
          className={`w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all ${
            errors.subject ? "border-destructive" : "border-input"
          }`}
        />
        {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Nachricht *</label>
        <textarea
          value={form.message}
          onChange={(e) => handleChange("message", e.target.value)}
          placeholder="Ihre Nachricht..."
          rows={5}
          className={`w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none ${
            errors.message ? "border-destructive" : "border-input"
          }`}
        />
        {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
      </div>
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl">{error}</div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <><Send className="w-4 h-4" /> Nachricht senden</>
        )}
      </button>
    </form>
  );
}
