"use client";

// needs interactivity: form state, submission, success/error feedback
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function EmailForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong");
      }

      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-[var(--rh-accent-border)] bg-[var(--rh-accent-tint)] px-5 py-3.5 text-[14px] text-[var(--rh-accent)]">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        You&apos;re on the list — we&apos;ll reach out before launch.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-[440px] flex-col gap-2 sm:flex-row"
    >
      <Input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "loading"}
        className="h-11 flex-1 bg-bg-elev text-[14px]"
      />
      <Button
        type="submit"
        disabled={status === "loading"}
        className="h-11 gap-1.5 px-5 text-[14px]"
      >
        {status === "loading" ? "Joining…" : "Get early access"}
        {status !== "loading" && <ArrowRight className="h-3.5 w-3.5" />}
      </Button>
      {status === "error" && (
        <p className="text-[13px] text-destructive sm:col-span-2">{error}</p>
      )}
    </form>
  );
}
