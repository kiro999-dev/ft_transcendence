import { SetMetadata } from "@nestjs/common"

export const ROLES_KEY='roles'
export type Role = 'owner' | 'staff' | 'admin'
export const ROLES = (roles:Role)=>SetMetadata(ROLES_KEY,roles)