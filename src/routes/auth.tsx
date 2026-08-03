import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap, Loader2, Mail, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ignouPortals } from "@/lib/portals";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Student Login & Sign Up — IGNOU BCA Master Hub" },
      {
        name: "description",
        content:
          "Log in to IGNOU BCA Master Hub to save your study plan, progress, downloads and assignment submission records.",
      },
      { property: "og:title", content: "Student Login — IGNOU BCA Master Hub" },
      {
        property: "og:description",
        content: "Create your free student account to track BCA papers, assignments and study plan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/auth" }],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [enrolmentNo, setEnrolmentNo] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        navigate({ to: "/dashboard", replace: true });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName, enrolment_no: enrolmentNo },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setConfirmSent(true);
          toast.success("Check your email to confirm your account.");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent to your email.");
        setMode("signin");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-20">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-base font-extrabold">
              BCA <span className="text-gradient">Master Hub</span>
            </span>
          </Link>
          <h1 className="mt-8 text-3xl font-extrabold sm:text-4xl">
            Student login for your <span className="text-gradient">own records</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Sign in to save your study plan, topic progress, downloaded papers and assignment
            submission tracker — available on every device.
          </p>

          <div className="mt-8 rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">IGNOU official portals (LMS)</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {ignouPortals.slice(0, 4).map((p) => (
                <li key={p.url}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {p.name}
                  </a>
                  <span className="text-muted-foreground"> — {p.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
          {confirmSent ? (
            <div className="text-center">
              <Mail className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-4 text-xl font-bold">Confirm your email</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a confirmation link to <strong>{email}</strong>. Click it, then come back and
                sign in.
              </p>
              <Button variant="outline" className="mt-6 w-full" onClick={() => setConfirmSent(false)}>
                Back to login
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold">
                {mode === "signin"
                  ? "Student Login"
                  : mode === "signup"
                    ? "Create your account"
                    : "Reset your password"}
              </h2>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                {mode === "signup" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        maxLength={100}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="enrolmentNo">Enrolment number</Label>
                      <Input
                        id="enrolmentNo"
                        value={enrolmentNo}
                        maxLength={30}
                        onChange={(e) => setEnrolmentNo(e.target.value)}
                        placeholder="e.g. 2200123456"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    maxLength={255}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {mode !== "forgot" && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      value={password}
                      minLength={6}
                      maxLength={72}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === "signin"
                    ? "Sign in"
                    : mode === "signup"
                      ? "Create account"
                      : "Send reset link"}
                </Button>
              </form>

              {mode !== "forgot" && (
                <>
                  <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
                  </div>
                  <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={busy}>
                    Continue with Google
                  </Button>
                </>
              )}

              <div className="mt-6 space-y-2 text-center text-sm text-muted-foreground">
                {mode === "signin" ? (
                  <>
                    <p>
                      New here?{" "}
                      <button className="font-semibold text-primary" onClick={() => setMode("signup")}>
                        Create an account
                      </button>
                    </p>
                    <p>
                      <button
                        className="inline-flex items-center gap-1 text-primary"
                        onClick={() => setMode("forgot")}
                      >
                        <KeyRound className="h-3.5 w-3.5" /> Forgot password?
                      </button>
                    </p>
                  </>
                ) : (
                  <p>
                    Already have an account?{" "}
                    <button className="font-semibold text-primary" onClick={() => setMode("signin")}>
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
