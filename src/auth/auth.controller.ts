import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AccessTokenGuard } from './guards';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { GetCurrentAccount } from './decorators/get-current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('/login')
  @HttpCode(HttpStatus.CREATED)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/logout')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AccessTokenGuard)
  logout(@Req() req: Request) {
    const userId = req.user?.['id'] as number;

    return this.authService.logout(userId);
  }

  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  refreshToken(
    @GetCurrentAccount('sub') id: number,
    @GetCurrentAccount('refreshToken') refreshToken: string,
    @GetCurrentAccount('email') email: string,
  ) {
    return this.authService.refreshToken(id, email, refreshToken);
  }

  @Post('/verify/:token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  verifyEmail(@Req() req: Request, @Param('token') tokenParams: string) {
    const userId = req.user?.['id'] as number;
    const userToken = req.user?.['emailVerificationToken'] as string;
    return this.authService.verifyEmail(userId, userToken, tokenParams);
  }
}
