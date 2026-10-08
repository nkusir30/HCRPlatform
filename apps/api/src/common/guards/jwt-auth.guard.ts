import { Injectable, ExecutionContext, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err: Error, user: any, info: any) {
    if (err || !user) {
      if (info?.name === 'UnauthorizedError') {
        throw new NotFoundException('User not found');
      }
      if (err?.name === 'InvalidTokenError') {
        throw new NotFoundException('Invalid token');
      }
      throw err || new ForbiddenException('Access denied');
    }
    return user;
  }
}
