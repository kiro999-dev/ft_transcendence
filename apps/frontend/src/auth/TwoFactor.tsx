import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

export const fetchMe = async (accessToken: string) => {
  const res = await fetch("http://localhost:3000/users/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
};

const API = "http://localhost:3000";
const COOLDOWN = 10;

export const TwoFactor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAccessToken, setUser } = useAuth();

  // tempToken can change if the server ever returns a new one
  const state = location.state as { tempToken?: string; email?: string } | null;
  const tempToken = state?.tempToken;

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(COOLDOWN); // a code was just sent at login
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // countdown for the resend button
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  // opened the page directly (no temp token): back to login
  if (!tempToken) return <Navigate to="/login" replace />;

  const getMessage = (json: any, fallback: string) =>
    (Array.isArray(json?.message) ? json.message[0] : json?.message) || fallback;

  const handleVerify = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/2fa/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // so the refresh cookie is accepted
        body: JSON.stringify({ tempToken, code }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = getMessage(json, "Invalid code");
        toast.error(msg);
        // session or code is dead: go back to login
        if (res.status === 401 && /session expired/i.test(msg)) {
          navigate("/login", { replace: true });
        }
        setCode("");
        return;
      }

      setAccessToken(json.accessToken);
      setUser(await fetchMe(json.accessToken));
      toast.success("Welcome back! You're now signed in.");
      navigate("/dashboard", { replace: true });
    } catch {
      toast.error("Something went wrong, please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await fetch(`${API}/auth/2fa/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(getMessage(json, "Could not resend the code"));
        // if the backend tells us how long to wait, use it
        const wait = json?.retryAfter ?? json?.message?.retryAfter;
        if (typeof wait === "number") setSecondsLeft(wait);
        return;
      }

      toast.success(json.message || "A new code has been sent");
      setCode("");
      setSecondsLeft(COOLDOWN);
    } catch {
      toast.error("Something went wrong, please try again");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-xl sm:p-10">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Two-factor verification
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter the 6-digit code we sent to{" "}
          <span className="font-medium text-slate-900">
            {state?.email ?? "your email"}
          </span>
          . It expires in 10 minutes.
        </p>

        <form onSubmit={handleVerify} className="mt-8 flex flex-col gap-5">
          <div>
            <label
              htmlFor="code"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Verification code
            </label>
            <input
              ref={inputRef}
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-center text-lg tracking-[0.5em] text-slate-900 placeholder:tracking-normal placeholder:text-slate-400 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6 text-sm">
          <button
            type="button"
            onClick={handleResend}
            disabled={secondsLeft > 0}
            className="font-semibold text-blue-600 transition-colors hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : "Resend code"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="text-slate-600 hover:text-slate-900"
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
};