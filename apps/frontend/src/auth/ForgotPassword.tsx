import { useState } from "react";
import { MdOutlineMarkEmailUnread } from "react-icons/md";
import { Link } from "react-router-dom";



const BackToLogin = () => (
  <p className="mt-8 border-t border-slate-100 pt-6 text-center text-sm">
    <Link
      to="/login"
      className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
    >
       Back to sign in
    </Link>
  </p>
);

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: send `email` to your forgot-password API
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-xl sm:p-10">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <MdOutlineMarkEmailUnread />
        </div>

        {submitted ? (
          <>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Check your email
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              If an account exists for{" "}
              <span className="font-semibold text-slate-900">{email}</span>,
              we've sent a link to reset your password.
            </p>

            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-8 w-full rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
            >
              Use a different email
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Forgot your password?
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Enter the email linked to your account and we'll send you a
              link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@agency.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Send reset link
              </button>
            </form>
          </>
        )}

        <BackToLogin />
      </div>
    </div>
  );
};