import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

const validatePassword = (password: string): string | undefined => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 128) return "Password must be at most 128 characters";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number";
  return undefined;
};

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const reset_token = searchParams.get("token");

  const [NewPassword, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string>();
  const [confirmError, setConfirmError] = useState<string>();
  const [done, setDone] = useState(false);

  if (!reset_token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-xl sm:p-10">
          <h1 className="text-2xl font-extrabold text-slate-900">
            Invalid reset link
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This password reset link is missing or invalid. Request a new one
            to continue.
          </p>

          <Link to="/forgot-password">
            <button className="mt-8 w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700">
              Request a new link
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const pwError = validatePassword(NewPassword);
    const matchError =
      confirmPassword !== NewPassword ? "Passwords do not match" : undefined;

    setPasswordError(pwError);
    setConfirmError(matchError);
    if (pwError || matchError) return;

    try {
      const res = await fetch("http://localhost:3000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset_token, NewPassword }),
      });

      if (!res.ok) {
        setPasswordError("This link has expired or is no longer valid.");
        return;
      }

      setDone(true);
    } catch {
      setPasswordError("Something went wrong. Please try again.");
    }
  };

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-xl sm:p-10">
          <h1 className="text-2xl font-extrabold text-slate-900">
            Password reset
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Your password has been updated. You can now sign in with your new
            password.
          </p>

          <Link to="/login">
            <button className="mt-8 w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700">
              Back to sign in
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-xl sm:p-10">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Reset your password
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Choose a new password for your account.
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-8 flex flex-col gap-5"
        >
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              New password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={NewPassword}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              aria-invalid={!!passwordError}
              className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 ${
                passwordError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-300 focus:border-blue-600 focus:ring-blue-600/20"
              }`}
            />

            {passwordError ? (
              <p role="alert" className="mt-1.5 text-xs text-red-600">
                {passwordError}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-slate-500">
                Use 8+ characters with an uppercase letter, a lowercase
                letter and a number.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Confirm new password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              aria-invalid={!!confirmError}
              className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 ${
                confirmError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-300 focus:border-blue-600 focus:ring-blue-600/20"
              }`}
            />

            {confirmError && (
              <p role="alert" className="mt-1.5 text-xs text-red-600">
                {confirmError}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="mt-1 w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Reset password
          </button>
        </form>
      </div>
    </div>
  );
};