import {ROLE_LABELS,roleBadgeStyle,} from "../organization_types"
import type {Role,} from "../organization_types"
export const RoleBadge = ({ role }: { role: Role }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadgeStyle[role]}`}
  >
    {ROLE_LABELS[role] ?? role}
  </span>
);