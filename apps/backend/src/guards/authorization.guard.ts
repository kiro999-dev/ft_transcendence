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
    const request = context.switchToHttp().getRequest()

    const requiredRole = this.reflector.getAllAndOverride<Role>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRole) return true

    const userRole = request.user?.role
    if (requiredRole !== userRole) {
      throw new ForbiddenException('You are not allowed')
    }
    return true
  }
}