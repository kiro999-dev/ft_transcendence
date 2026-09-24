import { useState } from "react";

interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

interface InputProps {
  name: keyof SignUpData;
  type: string;
  value: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
  hint?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField = ({
  name,
  type,
  value,
  label,
  placeholder,
  autoComplete,
  minLength,
  hint,
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
        minLength={minLength}
        onChange={onChange}
        required
        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
      />

      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
};

export const SignUp = () => {
  const [formData, setFormData] = useState<SignUpData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // TODO: send `formData` to your sign-up API
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-8 shadow-xl sm:p-10">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Create your agency account
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Start turning WhatsApp leads into booked visits.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <InputField
              name="firstName"
              type="text"
              label="First name"
              placeholder="Sara"
              autoComplete="given-name"
              value={formData.firstName}
              onChange={handleChange}
            />

            <InputField
              name="lastName"
              type="text"
              label="Last name"
              placeholder="Benali"
              autoComplete="family-name"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <InputField
            name="email"
            type="email"
            label="Email"
            placeholder="you@agency.com"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
          />

          <InputField
            name="phone"
            type="tel"
            label="Phone number"
            placeholder="+212 6 00 00 00 00"
            autoComplete="tel"
            value={formData.phone}
            onChange={handleChange}
          />

          <InputField
            name="password"
            type="password"
            label="Password"
            placeholder="Create a password"
            autoComplete="new-password"
            minLength={8}
            hint="Use at least 8 characters."
            value={formData.password}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="mt-1 w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Create account
          </button>
        </form>

        <p className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};