import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY, Role } from '../decorator/roles.decorator'

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
  const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);
  if (!requiredRoles?.length) return true;

  const { user } = context.switchToHttp().getRequest();
  if (!user || !requiredRoles.includes(user.role)) {
    throw new ForbiddenException('You do not have permission');
  }
  return true;
}
}