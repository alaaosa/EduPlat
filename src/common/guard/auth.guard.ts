import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TokenService } from '../security/token';
import { UserRepository } from 'src/user/repo/user';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
    private userRepo: UserRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const { Authorization } = request.headers as {Authorization : string};


    if (!Authorization || !Authorization.startsWith('Bearer ')) 
      throw new UnauthorizedException('Invalid Token');
    

    const token = Authorization.split(' ')[1];

    const user = await this.tokenService.verify(token, {
      secret: process.env.JWT_SECRET,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid Token');
    }

    request.user = user;

    return true;
  }
}
