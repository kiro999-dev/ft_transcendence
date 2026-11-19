export type Role = "owner" | "moderator" | "staff";

export interface OrgMember {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: Role;
}

export interface NewMemberForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
}


export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  moderator: "Moderator",
  staff: "Staff",
};


type RoleOption = { value: Role; label: string }
export const ROLE_OPTIONS: RoleOption[] = [
  { value: "moderator", label: ROLE_LABELS.moderator },
  { value: "staff", label: ROLE_LABELS.staff },
];

export const roleBadgeStyle: Record<Role, string> = {
  owner: "bg-blue-50 text-blue-400",
  moderator: "bg-amber-50 text-amber-700",
  staff: "bg-slate-100 text-slate-600",
};
