import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interfaces/jwt.payload';
import { AuthService } from '../auth.service';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor( 
    private jwtService: JwtService,
    private authService: AuthService
  ){}

  async canActivate(context: ExecutionContext ): Promise<boolean> {

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
        console.log(request);
        console.log(token);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        token,
        {
          secret: process.env.SECRET_KEY
        }
      );
  
      console.log({payload})

      const user: User = await this.authService.findUserById( payload.id );

      console.log({user})

      if( !user ) throw new UnauthorizedException('no existe el usuario');
      console.log('1')
      // if( !user.isActive ) throw new UnauthorizedException('el usuario no esta activo');
      console.log('2')

      
      request['user'] = user;
    } catch (error) {
      console.log('entra aqui')
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
