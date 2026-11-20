import { useState } from "react";
import toast from "react-hot-toast";

import { apiFetch } from "../../lib/api";
import type { Role, OrgMember } from "../organization_types";
import { ROLE_OPTIONS } from "../organization_types";

import { RoleBadge } from "../componenets/RoleBadge";

import {Initials} from "../componenets/Initials"


export const TeamMembersCard = ({
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