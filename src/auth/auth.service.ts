import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { IUserToken } from './models';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AUTH_MESSAGE } from 'src/constants/messages';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private readonly _saltOrRounds = 10;
  private readonly _accessTokenExpiresTime = '15s';
  private readonly _refreshTokenExpiresTime = 60 * 60 * 24 * 15;

  async register(registerDto: RegisterDto) {
    const { email, password, ...rest } = registerDto;

    const isExist = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (isExist) throw new BadRequestException(AUTH_MESSAGE.EMAIL_AVAILABLE);

    const hashPassword = await bcrypt.hash(password, this._saltOrRounds);

    await this.prismaService.user.create({
      data: { email, password: hashPassword, ...rest },
    });

    return { message: AUTH_MESSAGE.REGISTER_SUCCESS };
  }

  async login(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;

    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(AUTH_MESSAGE.ACCOUNT_NOT_AVAILABLE);
    }

    const passwordFromDb = user.password;
    const isMatchPassword = await bcrypt.compare(password, passwordFromDb);

    if (!isMatchPassword) {
      throw new UnauthorizedException(AUTH_MESSAGE.WRONG_PASSWORD);
    }

    const { accessToken, refreshToken } = await this.generateToken(
      user.id,
      email,
    );

    //save refresh token to DB
    await this.prismaService.userToken.upsert({
      where: { userId: user.id },
      create: { userId: user.id, refreshToken },
      update: { refreshToken },
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(
    userId: number,
    email: string,
    refreshTokenPayload: string,
  ): Promise<IUserToken> {
    const userToken = await this.prismaService.userToken.findUnique({
      where: {
        userId: userId,
      },
    });

    if (
      !userToken ||
      !userToken.refreshToken ||
      userToken.refreshToken !== refreshTokenPayload
    ) {
      throw new UnauthorizedException('Access denied!');
    }

    const { accessToken, refreshToken } = await this.generateToken(
      userId,
      email,
    );

    //save refresh token to DB
    await this.prismaService.userToken.update({
      where: { userId },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  }

  async logout(id: number) {
    await this.prismaService.userToken.update({
      where: { userId: id },
      data: { refreshToken: null },
    });
    return { message: 'Logged out!' };
  }

  async generateToken(id: number, email: string): Promise<IUserToken> {
    const payload = { sub: id, email };

    const signAccessTokenPromise = this.jwtService.signAsync(payload, {
      expiresIn: this._accessTokenExpiresTime,
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET_KEY'),
    });

    const signRefreshTokenPromise = this.jwtService.signAsync(payload, {
      expiresIn: this._refreshTokenExpiresTime,
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET_KEY'),
    });

    const [accessToken, refreshToken] = await Promise.all([
      signAccessTokenPromise,
      signRefreshTokenPromise,
    ]);

    return { accessToken, refreshToken };
  }
}
