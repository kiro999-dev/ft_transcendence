import { IsNotEmpty ,IsIn} from "class-validator";
import type {Role} from "../decorator/roles.decorator";

export class RoleDto
{
    @IsNotEmpty()
    @IsIn(['staff', 'owner'])
    role:Role
}