import { useState } from "react";
import { isValidPhoneNumber } from "libphonenumber-js/max";
import toast from "react-hot-toast";



interface SignUpData {
  organizationName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

type InputFieldConfig = {
  name: keyof SignUpData;
  type: "text" | "email" | "tel" | "password";
  label: string;
  placeholder: string;
  autoComplete: string;
  hint?: string;
};
const inputFields: InputFieldConfig[] = [
  {
    name: "organizationName",
    type: "text",
    label: "Agency name",
    placeholder: "Atlas Immobilier",
    autoComplete: "organization",
  },
  {
    name: "firstName",
    type: "text",
    label: "First name",
    placeholder: "Jeff",
    autoComplete: "given-name",
  },
  {
    name: "lastName",
    type: "text",
    label: "Last name",
    placeholder: "Jeffy",
    autoComplete: "family-name",
  },
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "you@agency.com",
    autoComplete: "email",
  },
  {
    name: "phone",
    type: "tel",
    label: "Phone number",
    placeholder: "+212600000000",
    autoComplete: "tel",
    hint: "Include your country code, e.g. +212.",
  },
  {
    name: "password",
    type: "password",
    label: "Password",
    placeholder: "Create a password",
    autoComplete: "new-password",
    hint: "Use 8+ characters with an uppercase letter, a lowercase letter and a number.",
  },
];
type Field = keyof SignUpData;
type Errors = Partial<Record<Field, string>>;

const normalizeOrganizationName = (value: string) =>
  value.trim().replace(/\s+/g, " ");


const EMAIL_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9_.-]+[a-zA-Z0-9]@[a-zA-Z]+\.[a-z]{1,3}$/;


const validateName = (value: string, label: string): string | undefined => {
  if (!value) return `${label} is required`;
  if (value.length < 2) return `${label} must be at least 2 characters`;
  if (value.length > 100) return `${label} must be at most 100 characters`;
  if (/\s/.test(value)) return `${label} must not contain spaces`;
  return undefined;
};

const validate = (data: SignUpData): Errors => {
  const errors: Errors = {};


  const agency = normalizeOrganizationName(data.organizationName);
  if (!agency) errors.organizationName = "Agency name is required";
  else if (agency.length < 2)
    errors.organizationName = "Agency name must be at least 2 characters";
  else if (agency.length > 150)
    errors.organizationName = "Agency name must be at most 150 characters";


  errors.firstName = validateName(data.firstName, "First name");
  errors.lastName = validateName(data.lastName, "Last name");


  if (!data.email) errors.email = "Email is required";
  else if (data.email.length > 255)
    errors.email = "Email must be at most 255 characters";
  else if (!EMAIL_REGEX.test(data.email))
    errors.email = "Enter a valid email address";


  if (!data.phone) errors.phone = "Phone number is required";
  else if (!isValidPhoneNumber(data.phone))
    errors.phone =
      "Enter a valid phone number with country code, e.g. +212600000000";


  const { password } = data;
  if (!password) errors.password = "Password is required";
  else if (password.length < 8)
    errors.password = "Password must be at least 8 characters";
  else if (password.length > 128)
    errors.password = "Password must be at most 128 characters";
  else if (!/[A-Z]/.test(password))
    errors.password = "Password must contain at least one uppercase letter";
  else if (!/[a-z]/.test(password))
    errors.password = "Password must contain at least one lowercase letter";
  else if (!/[0-9]/.test(password))
    errors.password = "Password must contain at least one number";

  return errors;
};


interface InputProps {
  name: Field;
  type: string;
  value: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField = ({
  name,
  type,
  value,
  label,
  placeholder,
  autoComplete,
  hint,
  error,
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
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 ${error
          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
          : "border-slate-300 focus:border-blue-600 focus:ring-blue-600/20"
          }`}
      />

      {error ? (
        <p
          id={`${name}-error`}
          role="alert"
          className="mt-1.5 text-xs text-red-600"
        >
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
};


export const SignUp = () => {

  
  const [formData, setSignUpData] = useState<SignUpData>({
    organizationName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Errors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();


    const newErrors = validate(formData);
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors) return;

    const payload: SignUpData = {
      ...formData,
      organizationName: normalizeOrganizationName(formData.organizationName),
    };
    try {
      const response = await fetch("http://localhost:3000/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to create account");
        return;
      }

      toast.success("Account created successfully!");

     
    } catch (error) {

    }
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-8 shadow-xl sm:p-10">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Create your agency account
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Start turning WhatsApp leads into booked visits.
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-8 flex flex-col gap-5"
        >
          {inputFields.map((field) => (
            <InputField
              key={field.name}
              {...field}
              value={formData[field.name]}
              error={errors[field.name]}
              onChange={handleChange}
            />
          ))}
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