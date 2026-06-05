import type { UserPublicDto } from './user.dto.js';

export interface RegisterRequestDto {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseDto {
  user: UserPublicDto;
  tokens: AuthTokensDto;
}

export interface ValidateTokenRequestDto {
  accessToken: string;
}

export interface ValidateTokenResponseDto {
  valid: boolean;
  userId?: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}