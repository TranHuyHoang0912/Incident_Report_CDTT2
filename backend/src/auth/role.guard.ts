import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Chỉ admin được phép thực hiện!');
    }
    return true;
  }
}
