import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty({ message: 'email is require' })
  email: string;

  @MinLength(6, { message: 'Password must be longer than 6 characters!' })
  @IsNotEmpty({ message: 'password is require' })
  password: string;
}
