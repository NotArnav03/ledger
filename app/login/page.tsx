"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";

  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "register") {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setError(j.error || "Could not register.");
          setLoading(false);
          return;
        }
      }

      const r = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!r?.ok) {
        setError(
          r?.error === "CredentialsSignin"
            ? "Invalid email or password."
            : "Could not sign in. Please try again."
        );
        setLoading(false);
        return;
      }
      const safe =
        callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
          ? callbackUrl
          : "/";
      router.replace(safe);
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <main
      className="mx-auto"
      style={{ maxWidth: 480, padding: "80px 40px" }}
    >
      <div className="small-caps">Ledger</div>
      <h1
        className="serif mt-2"
        style={{ fontSize: 36, letterSpacing: "-0.02em" }}
      >
        {mode === "signin" ? "Return to your books." : "Open a new ledger."}
      </h1>
      <p
        className="serif-italic mt-3 text-mute"
        style={{ fontSize: 15, lineHeight: 1.5 }}
      >
        {mode === "signin"
          ? "Sign in to read what you have written."
          : "Create an account to begin recording."}
      </p>

      <form onSubmit={handleSubmit} className="mt-10">
        <Field label="Email">
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="serif text-ink py-1 w-full"
            style={{ fontSize: 15 }}
            autoComplete="email"
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="serif text-ink py-1 w-full"
            style={{ fontSize: 15 }}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
        </Field>

        {error && (
          <div
            className="mt-4 serif-italic"
            style={{ color: "#c2410c", fontSize: 13 }}
          >
            {error}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "register" : "signin");
              setError(null);
            }}
            className="small-caps text-rule hover:text-accent tr-120"
          >
            {mode === "signin" ? "Need an account?" : "Have an account?"}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-ink text-paper hover:bg-accent tr-120 font-mono text-[11px] uppercase tracking-[0.12em] disabled:opacity-40"
          >
            {loading
              ? "…"
              : mode === "signin"
              ? "Sign in ↵"
              : "Register ↵"}
          </button>
        </div>
      </form>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="grid gap-4 items-baseline hairline-b"
      style={{
        gridTemplateColumns: "100px 1fr",
        paddingTop: 10,
        paddingBottom: 10,
      }}
    >
      <label className="small-caps">{label}</label>
      <div>{children}</div>
    </div>
  );
}
