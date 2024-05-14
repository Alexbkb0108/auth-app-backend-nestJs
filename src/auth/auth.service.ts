import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcryptjs from "bcryptjs";
import { CreatLoginrDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt.payload';
import { LoginResponse } from './interfaces/login.response';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {

  constructor( 
    @InjectModel(User.name ) 
    private userModel: Model<User>,
    private jwtService: JwtService,
  ){}

  async create(CreateUserDto: CreateUserDto): Promise<LoginResponse> {
    
    try {
      const { password, ...userData} = CreateUserDto;
      const user = new this.userModel( {
        password: bcryptjs.hashSync( password, 10 ),
        ...userData,
      } )
      await user.save();
      const { password:_, ...toUser } = user.toJSON();
      
      return {user: toUser, token: this.getJwt( {id: user.id} )};
    } catch (error) {
      console.log(error)
    }

  }

  async register(RegisterUserDto: RegisterUserDto): Promise<LoginResponse>{

    const user = await this.create( RegisterUserDto );

    return {
      user: user.user,
      token: this.getJwt({id: user.user._id})
    }
  }

  async login(CreatLoginrDto: CreatLoginrDto) {
    const { password, email } = CreatLoginrDto;
    console.log(password, email)
    const user = await this.userModel.findOne({ email: email });
    if(!user){
      throw new UnauthorizedException('Not valid user');
    }

    if( !bcryptjs.compareSync( password, user.password )){
      throw new UnauthorizedException('Not valid password');
    }

    const { password:_, ...rest} = user.toJSON();

    return {
      user: rest,
      token: this.getJwt( {id: user.id } ),
    };
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find();
  }

  async findUserById( id: string ): Promise<User> {
    const user: User = await this.userModel.findById( id );
    const dtoUser: User = {
      _id: user._id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      roles: user.roles
    }
    const {password, ...userAll} = user;
    return dtoUser;
  }

  getJwt( payload: JwtPayload ){
    const token = this.jwtService.sign(payload);
    return token;
  }
}
