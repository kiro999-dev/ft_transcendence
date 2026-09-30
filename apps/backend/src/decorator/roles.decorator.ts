import { SetMetadata } from "@nestjs/common"

export const ROLES_KEY='roles'
export type Roles = 'owner' | 'staff' | 'admin'
export const ROLES = (roles:Roles)=>SetMetadata(ROLES_KEY,roles)