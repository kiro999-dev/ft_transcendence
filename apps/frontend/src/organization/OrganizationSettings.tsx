import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../lib/api";
import type { Role, OrgMember, NewMemberForm } from "./organization_types";
import { ROLE_OPTIONS } from "./organization_types";
import { Spinner } from "./componenets/Spinner";
import { RoleBadge } from "./componenets/RoleBadge";
import { OrganizationNameCard } from "./componenets/OrganizationNameCard";

const Initials = ({
  firstName,
  lastName,
}: {
  firstName?: string;
  lastName?: string;
}) => (
  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
    {(firstName?.[0] ?? "") + (lastName?.[0] ?? "")}
  </div>
);

const AddMemberModal = ({
  accessToken,
  onClose,
  onAdded,
}: {
  accessToken: string | null;
  onClose: () => void;
  onAdded: (member: OrgMember) => void;
}) => {
  const [form, setForm] = useState<NewMemberForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "staff",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof NewMemberForm, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = (): typeof errors => {
    const next: typeof errors = {};
    if (!form.firstName.trim()) next.firstName = "First name is required";
    if (!form.lastName.trim()) next.lastName = "Last name is required";
    if (!form.email.trim()) next.email = "Email is required";
    if (!form.phone.trim()) next.phone = "Phone number is required";
    if (!form.password || form.password.length < 8)
      next.password = "Password must be at least 8 characters";
    return next;
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const next = validate();
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSubmitting(true);
    try {
      const res = await apiFetch("/organization/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const body = await res.json();
      if (!res.ok) {
        toast.error(body.message ?? "Could not add this team member");
        return;
      }

      toast.success("Team member added");
      onAdded(body.member);
      onClose();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <h2 className="text-lg font-bold text-slate-900">Add team member</h2>
        <p className="mt-1 text-sm text-slate-600">
          Invite a new member to your agency.
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                First name
              </label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                  errors.firstName
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-slate-300 focus:border-blue-600 focus:ring-blue-600/20"
                }`}
              />
              {errors.firstName && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Last name
              </label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                  errors.lastName
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-slate-300 focus:border-blue-600 focus:ring-blue-600/20"
                }`}
              />
              {errors.lastName && (
                <p className="mt-1.5 text-xs text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-300 focus:border-blue-600 focus:ring-blue-600/20"
              }`}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Phone number
            </label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+212600000000"
              className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                errors.phone
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-300 focus:border-blue-600 focus:ring-blue-600/20"
              }`}
            />
            {errors.phone && (
              <p className="mt-1.5 text-xs text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Temporary password
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                errors.password
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-300 focus:border-blue-600 focus:ring-blue-600/20"
              }`}
            />
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Adding..." : "Add member"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TeamMembersCard = ({
  members,
  currentUserId,
  currentUserRole,
  accessToken,
  onRemoved,
  onRoleChanged,
  onAddClick,
}: {
  members: OrgMember[];
  currentUserId?: string;
  currentUserRole?: Role;
  accessToken: string | null;
  onRemoved: (id: string) => void;
  onRoleChanged: (id: string, role: Role) => void;
  onAddClick: () => void;
}) => {
  const isOwner = currentUserRole === "owner";
  const isModerator = currentUserRole === "moderator";
  const canAdd = isOwner || isModerator;
  const [removingId, setRemovingId] = useState<string>();

  // Nobody can change or remove the owner or themselves.
  // Owners can manage everyone else; moderators can only manage staff.
  const canChangeRole = (member: OrgMember) => {
    if (member.id === currentUserId || member.role === "owner") return false;
    if (isOwner) return true;
    if (isModerator) return member.role === "staff";
    return false;
  };

  const canRemoveMember = (member: OrgMember) =>
    isOwner && member.id !== currentUserId && member.role !== "owner";

  const handleRoleChange = async (member: OrgMember, role: Role) => {
    try {
      const res = await apiFetch(`/organization/users/${member.id}/role`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        toast.error("Could not update this member's role");
        return;
      }

      onRoleChanged(member.id, role);
      toast.success("Role updated");
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleRemove = async (member: OrgMember) => {
    const confirmed = window.confirm(
      `Remove ${member.first_name} ${member.last_name} from your agency?`,
    );
    if (!confirmed) return;

    setRemovingId(member.id);
    try {
      const res = await apiFetch(`/organization/users/${member.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        toast.error("Could not remove this team member");
        return;
      }

      onRemoved(member.id);
      toast.success("Team member removed");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setRemovingId(undefined);
    }
  };

  return (
  <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-xl sm:p-8">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Team members</h2>
        <p className="mt-1 text-sm text-slate-600">
          People with access to your agency's workspace.
        </p>
      </div>

      {canAdd && (
        <button
          onClick={onAddClick}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          Add member
        </button>
      )}
    </div>

    <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Member
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Role
            </th>
            <th scope="col" className="px-4 py-3 text-right">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {members.map((member) => {
            const isSelf = member.id === currentUserId;

            return (
              <tr key={member.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Initials
                      firstName={member.first_name}
                      lastName={member.last_name}
                    />
                    <p className="text-sm font-semibold text-slate-900">
                      {member.first_name} {member.last_name}
                      {isSelf && (
                        <span className="ml-1.5 text-xs font-normal text-slate-400">
                          (you)
                        </span>
                      )}
                    </p>
                  </div>
                </td>

                <td className="px-4 py-3">
                  {canChangeRole(member) ? (
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleRoleChange(member, e.target.value as Role)
                      }
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <RoleBadge role={member.role} />
                  )}
                </td>


                <td className="px-4 py-3 text-right">
                  {canRemoveMember(member) && (
                    <button
                      onClick={() => handleRemove(member)}
                      disabled={removingId === member.id}
                      className="text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"
                    >
                      {removingId === member.id ? "Removing..." : "Remove"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
          {members.length === 0 && (
            <tr>
              <td
                colSpan={3}
                className="py-8 text-center text-sm text-slate-500"
              >
                No team members yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
};

export const OrgSettings = () => {
  const { accessToken, user } = useAuth();
  const [orgName, setOrgName] = useState("");
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [orgRes, membersRes] = await Promise.all([
          apiFetch("/organization/us", {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          apiFetch("/organization/users", {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);

        if (orgRes.ok) {
          const orgData = await orgRes.json();
          setOrgName(orgData.organization_name);
        }

        if (membersRes.ok) {
          setMembers(await membersRes.json());
        }
      } catch {
        toast.error("Could not load organization settings");
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) load();
  }, [accessToken]);

  const currentUserRole = user?.role as Role | undefined;

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Organization settings
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage your agency's name and team.
        </p>

        {loading ? (
          <Spinner />
        ) : (
          <div className="mt-8">
            <OrganizationNameCard
              name={orgName}
              canEdit={currentUserRole === "owner"}
              accessToken={accessToken}
              onSaved={setOrgName}
            />

            <TeamMembersCard
              members={members}
              currentUserId={user?.id}
              currentUserRole={currentUserRole}
              accessToken={accessToken}
              onAddClick={() => setShowAddModal(true)}
              onRemoved={(id) =>
                setMembers((prev) => prev.filter((m) => m.id !== id))
              }
              onRoleChanged={(id, role) =>
                setMembers((prev) =>
                  prev.map((m) => (m.id === id ? { ...m, role } : m)),
                )
              }
            />
          </div>
        )}
      </div>

      {showAddModal && (
        <AddMemberModal
          accessToken={accessToken}
          onClose={() => setShowAddModal(false)}
          onAdded={(member) => setMembers((prev) => [...prev, member])}
        />
      )}
    </div>
  );
};
