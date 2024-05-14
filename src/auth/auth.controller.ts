import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { CreatLoginrDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthGuard } from './guards/auth.guard';
import { User } from './entities/user.entity';
import { LoginResponse } from './interfaces/login.response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() CreateUserDto: CreateUserDto) {
    return this.authService.create(CreateUserDto);
  }

  @Post('/login')
  login(@Body() CreatLoginrDto: CreatLoginrDto) {
    console.log('entra')
    return this.authService.login(CreatLoginrDto);
  }

  @Post('/register')
  register(@Body() RegisterUserDto: RegisterUserDto) {
    return this.authService.register(RegisterUserDto);
  }

  @UseGuards( AuthGuard )
  @Get()
  findAll( @Request() req: Request ) {
    return this.authService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findUserById(id);
  // }

  @UseGuards( AuthGuard )
  @Get('check-token')
  checkToken( @Request() req: Request ): LoginResponse {
    console.log('entra');
    const user = req['user'] as User;
    console.log(user);
    return {
      user: user,
      token: this.authService.getJwt({id: user._id})
    };
  }
}
