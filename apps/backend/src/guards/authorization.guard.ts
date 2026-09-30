import { CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { ROLES_KEY } from "../decorator/roles.decorator";
import { Role } from "../users/users.service";


export class AuthorizationGuard implements CanActivate{
    constructor (private reflactor:Reflector){}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>
    {
        const request = context.switchToHttp().getRequest()
        const requiredRole:Role = this.reflactor.getAllAndOverride(ROLES_KEY,[context.getClass,context.getHandler])
        const userRole:Role = request.user.role;
        if(requiredRole !== userRole)
            throw new ForbiddenException("you are not allowd");
        return true
    }
}