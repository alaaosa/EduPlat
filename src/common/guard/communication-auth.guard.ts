import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from 'src/common/security/token';

@Injectable()
export class CommunicationAuthGuard implements CanActivate {
  constructor(private readonly tokens: TokenService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const header = request.headers.authorization;
    if (typeof header !== 'string' || !header.startsWith('Bearer ')) throw new UnauthorizedException('Authentication required');
    try {
      const payload = await this.tokens.verify(header.slice(7));
      const id = Number(payload?.id ?? payload?.sub);
      if (!Number.isSafeInteger(id) || id < 1) throw new Error('Invalid identity');
      request.user = { ...payload, id };
      return true;
    } catch { throw new UnauthorizedException('Authentication required'); }
  }
}
