import { useEffect, useState } from "react";
import { isValidPhoneNumber } from "libphonenumber-js/max";
import { useAuth } from "../../auth/AuthContext";
import { Loading } from "../../auth/ProtectedRout";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

interface ProfileData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

type Field = keyof ProfileData;
type Errors = Partial<Record<Field, string>>;

interface FieldProps {
    name: keyof ProfileData;
    type: string;
    value: string;
    label: string;
    disabled?: boolean;
    error?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}


const validateName = (value: string, label: string): string | undefined => {
    if (!value) return `${label} is required`;
    if (value.length < 2) return `${label} must be at least 2 characters`;
    if (value.length > 100) return `${label} must be at most 100 characters`;
    if (/\s/.test(value)) return `${label} must not contain spaces`;
    return undefined;
};

const validate = (data: ProfileData): Errors => {
    const errors: Errors = {};

    errors.firstName = validateName(data.firstName, "First name");
    errors.lastName = validateName(data.lastName, "Last name");

    if (!data.phone) errors.phone = "Phone number is required";
    else if (!isValidPhoneNumber(data.phone))
        errors.phone =
            "Enter a valid phone number with country code, e.g. +212600000000";

    return errors;
};

const Field = ({ name, type, value, label, onChange, disabled, error }: FieldProps) => (
    <div>
        <label
            htmlFor={name}
            className="mb-1.5 block text-sm font-medium text-slate-700"
        >
            {label}
        </label>

        <input
            disabled={disabled}
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
            className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 disabled:text-gray-400 transition-colors focus:outline-none focus:ring-2 ${error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-slate-300 focus:border-blue-600 focus:ring-blue-600/20"
                }`}
        />

        {error && (
            <p id={`${name}-error`} role="alert" className="mt-1.5 text-xs text-red-600">
                {error}
            </p>
        )}
    </div>
);

export const Profile = () => {
    const { accessToken, isLoading, user, setUser } = useAuth();
    const [data, setData] = useState<ProfileData>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });
    const [errors, setErrors] = useState<Errors>({});
    const [saved, setSaved] = useState(false);
    useEffect(() => {
        if (user)
            setData(
                {
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    phone: user.phone
                }
            )
    }, [user])

    if (isLoading) return <Loading />;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData({ ...data, [e.target.name]: e.target.value });
        setSaved(false);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors = validate(data);
        setErrors(newErrors);
        const hasErrors = Object.values(newErrors).some(Boolean);
        if (hasErrors) return;

        const payload = {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone
        }

        try {
            console.log(data)
            const res = await fetch("http://localhost:3000/users/me", {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),
            })
            if (!res.ok) {
                toast.error("something went wrong please try again ")
                return
            }
            const message = await res.json()
            if (message.success) {
                toast.success(message.message)
                setSaved(true);
                if (user) {
                    setUser({
                        ...user,
                        first_name: data.firstName,
                        last_name: data.lastName,
                        phone: data.phone,
                    });
                }
            }
            else {
                const messageobj = message.message;
                messageobj.map((msg: string) => {
                    toast.error(msg)
                })
            }
        } catch (error) {
            toast.error("something went wrong please try again")
        }

    };

    const initials = `${data.firstName[0] ?? ""}${data.lastName[0] ?? ""}`;

    return (
        <div className="min-h-screen bg-white px-4 py-12">
            <div className="mx-auto w-full max-w-lg">
                <h1 className="text-2xl font-extrabold text-slate-900">My profile</h1>
                <p className="mt-2 text-sm text-slate-600">
                    Manage your personal information.
                </p>

                <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-8 shadow-xl sm:p-10">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-semibold text-blue-600">
                            {initials}
                        </div>
                        <div>
                            <p className="text-base font-semibold text-slate-900">
                                {data.firstName} {data.lastName}
                            </p>
                            <p className="text-sm text-slate-500">{data.email}</p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        noValidate
                        className="mt-8 flex flex-col gap-5 border-t border-slate-100 pt-8"
                    >


                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                name="firstName"
                                type="text"
                                label="First name"
                                value={data.firstName}
                                error={errors.firstName}
                                onChange={handleChange}
                            />
                            <Field

                                name="lastName"
                                type="text"
                                label="Last name"
                                value={data.lastName}
                                error={errors.lastName}
                                onChange={handleChange}
                            />
                        </div>

                        <Field

                            name="email"
                            type="email"
                            label="Email"
                            value={data.email}
                            onChange={handleChange}
                            disabled={true}

                        />

                        <Field
                            name="phone"
                            type="tel"
                            label="Phone number"
                            value={data.phone}
                            error={errors.phone}
                            onChange={handleChange}

                        />

                        <div className="mt-1 flex items-center gap-4">
                            <button
                                type="submit"
                                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            >
                                Save changes
                            </button>

                            {saved && (
                                <p className="text-sm text-slate-500">Changes saved.</p>
                            )}
                        </div>
                    </form>

                    <div className="mt-6 border-t border-slate-100 pt-6 text-center">
                        <Link
                            to="/change-password"
                            className="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
                        >
                            Change password
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};