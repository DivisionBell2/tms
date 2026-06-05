import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type {
  AuthResponseDto,
  LoginRequestDto,
  RefreshTokenRequestDto,
  RegisterRequestDto,
  ValidateTokenRequestDto,
  ValidateTokenResponseDto,
} from '@tms/contracts';
import { UsersService } from './users.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  private signTokens(userId: string) {
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!accessSecret || !refreshSecret) {
      throw new Error('JWT secrets are not configured');
    }

    const accessToken = this.jwt.sign({ sub: userId }, {
      secret: accessSecret,
      expiresIn: (process.env.JWT_ACCESS_TTL ?? '15m') as JwtSignOptions['expiresIn'],
    });

    const refreshToken = this.jwt.sign({ sub: userId, type: 'refresh' }, {
      secret: refreshSecret,
      expiresIn: (process.env.JWT_REFRESH_TTL ?? '7d') as JwtSignOptions['expiresIn'],
    });

    return { accessToken, refreshToken };
  }

  async register(dto: RegisterRequestDto): Promise<AuthResponseDto> {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.users.createUser({
      email: dto.email,
      passwordHash,
      displayName: dto.displayName,
    });

    const tokens = this.signTokens(user.id);
    return { user: this.users.toPublic(user), tokens };
  }

  async login(dto: LoginRequestDto): Promise<AuthResponseDto> {
    const user = await this.users.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const tokens = this.signTokens(user.id);
    return { user: this.users.toPublic(user), tokens };
  }

  validateToken(dto: ValidateTokenRequestDto): ValidateTokenResponseDto {
    try {
      const payload = this.jwt.verify<{ sub: string }>(dto.accessToken, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      return { valid: true, userId: payload.sub };
    } catch {
      return { valid: false };
    }
  }

  async refresh(dto: RefreshTokenRequestDto): Promise<AuthResponseDto> {
    try {
      const payload = this.jwt.verify<{ sub: string; type?: string }>(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      if (payload.type !== 'refresh') throw new UnauthorizedException();

      const user = await this.users.findById(payload.sub);
      if (!user) throw new UnauthorizedException();

      const tokens = this.signTokens(user.id);
      return { user: this.users.toPublic(user), tokens };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}