import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { TokenService } from '../security/token';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);

    const { authorization } = request.headers as {
      authorization?: string;
    };

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid Token');
    }

    const token = authorization.split(' ')[1];

    const user = await this.tokenService.verify(token, {
      secret: process.env.JWT_SECRET,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid Token');
    }

    request.user = user;

    return true;
  }

  private getRequest(context: ExecutionContext) {
    if (context.getType<'http' | 'graphql'>() === 'http') {
      return context.switchToHttp().getRequest();
    }

    const gqlContext = GqlExecutionContext.create(context);
    return gqlContext.getContext().req;
  }
}
