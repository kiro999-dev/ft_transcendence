import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export const ROLE_VALUES = ['owner', 'admin', 'moderator', 'staff'] as const;
export type Role = (typeof ROLE_VALUES)[number];


export const ASSIGNABLE_ROLES = ['moderator', 'staff'] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export const ROLES = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);