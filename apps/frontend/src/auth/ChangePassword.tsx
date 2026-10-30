import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext"
import { useNavigate } from "react-router-dom";

interface Passwords {
  OldPassword: string;
  NewPassword: string;
  ConfirmPassword: string;
}

type Field = keyof Passwords;
type Errors = Partial<Record<Field, string>>;

const validateNewPassword = (password: string): string | undefined => {
  if (!password) return "New password is required";
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

const validate = (data: Passwords): Errors => {
  const errors: Errors = {};

  if (!data.OldPassword) errors.OldPassword = "Current password is required";

  errors.NewPassword = validateNewPassword(data.NewPassword);

  if (data.NewPassword && data.OldPassword === data.NewPassword)
    errors.NewPassword = "New password must be different from the current one";

  if (data.ConfirmPassword !== data.NewPassword)
    errors.ConfirmPassword = "Passwords do not match";

  return errors;
};

interface FieldProps {
  name: Field;
  label: string;
  value: string;
  hint?: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordField = ({ name, label, value, hint, error, onChange }: FieldProps) => (
  <div>
    <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}
    </label>

    <input
      id={name}
      name={name}
      type="password"
      value={value}
      onChange={onChange}
      autoComplete={name === "OldPassword" ? "current-password" : "new-password"}
      aria-invalid={!!error}
      aria-describedby={error ? `${name}-error` : undefined}
      className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 ${
        error
          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
          : "border-slate-300 focus:border-blue-600 focus:ring-blue-600/20"
      }`}
    />

    {error ? (
      <p id={`${name}-error`} role="alert" className="mt-1.5 text-xs text-red-600">
        {error}
      </p>
    ) : (
      hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
    )}
  </div>
);

export const ChangePassword = () => {
  const navigat = useNavigate()
  const { accessToken } = useAuth();
  const [passwords, setPasswords] = useState<Passwords>({
    OldPassword: "",
    NewPassword: "",
    ConfirmPassword: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors = validate(passwords);
    setErrors(newErrors);
    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors) return;

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:3000/auth/change-password", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          OldPassword: passwords.OldPassword,
          NewPassword: passwords.NewPassword,
        }),
      });

      if (!res.ok) {
        setErrors({ OldPassword: "Your current password is incorrect" });
        return;
      }

      toast.success("Password updated successfully");
      setPasswords({ OldPassword: "", NewPassword: "", ConfirmPassword: "" });
      navigat("/me")
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }

  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-xl sm:p-10">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Change password
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Enter your current password and choose a new one.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
          <PasswordField
            name="OldPassword"
            label="Current password"
            value={passwords.OldPassword}
            error={errors.OldPassword}
            onChange={handleChange}
          />

          <PasswordField
            name="NewPassword"
            label="New password"
            value={passwords.NewPassword}
            error={errors.NewPassword}
            hint="Use 8+ characters with an uppercase letter, a lowercase letter and a number."
            onChange={handleChange}
          />

          <PasswordField
            name="ConfirmPassword"
            label="Confirm new password"
            value={passwords.ConfirmPassword}
            error={errors.ConfirmPassword}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
};