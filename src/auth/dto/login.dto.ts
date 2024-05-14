import { IsEmail, IsString, MinLength } from "class-validator";

export class CreatLoginrDto {

    @IsEmail()    
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

}