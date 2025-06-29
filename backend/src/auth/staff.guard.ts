import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

export class StaffGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (req.user?.role !== 'STAFF') {
      throw new ForbiddenException('Chỉ staff mới có quyền thực hiện!');
    }
    return true;
  }
}
