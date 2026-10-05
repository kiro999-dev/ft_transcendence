import { IsIn } from 'class-validator';
import { ASSIGNABLE_ROLES } from '../decorator/roles.decorator';
import type { AssignableRole } from '../decorator/roles.decorator';

export class RoleDto {
  @IsIn(ASSIGNABLE_ROLES)
  role: AssignableRole;
}