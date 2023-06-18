import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'username is require!' })
  @MinLength(3, { message: 'username must be longer than 3 characters!' })
  username: string;

  @IsEmail()
  @IsNotEmpty({ message: 'email is require' })
  email: string;

  @MinLength(6, { message: 'Password must be longer than 6 characters!' })
  @IsNotEmpty({ message: 'password is require' })
  password: string;

  firstName?: string;
  lastName?: string;
}
