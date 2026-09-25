import { useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
interface Credentials {
  email: string;
  password: string;
}

interface InputProps {
  name: keyof Credentials;
  type: string;
  value: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputLogin = ({
  name,
  type,
  value,
  label,
  placeholder,
  autoComplete,
  onChange,
}: InputProps) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={onChange}
        required
        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
      />
    </div>
  );
};

export const Login = () => {
  const [credentials, setCredentials] = useState<Credentials>({
    email: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to login");
        return;
      }
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      toast.success("Welcome back! You're now signed in.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-xl sm:p-10">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Sign in to Auto Estate
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter your email and password to continue.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <InputLogin
            name="email"
            type="email"
            label="Email"
            placeholder="you@agency.com"
            autoComplete="email"
            value={credentials.email}
            onChange={handleChange}
          />

          <InputLogin
            name="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={credentials.password}
            onChange={handleChange}
          />

          <div className="flex items-center justify-between">
            <label
              htmlFor="remember"
              className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"
            >
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-blue-600"
              />
              Remember me
            </label>

            <Link
              to="/forgot-password"
              className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="mt-1 w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Sign in
          </button>
        </form>

        <p className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link
            to="/sign-up"
            className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
          >
            Create an agency account
          </Link>
        </p>
      </div>
    </div>
  );
};
