import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CMD_AUTH_LOGIN,
  CMD_AUTH_REFRESH,
  CMD_AUTH_REGISTER,
  CMD_AUTH_VALIDATE_TOKEN,
  CMD_USER_CHANGE_PASSWORD,
  CMD_USER_GET_BY_ID,
  CMD_USER_UPDATE_PROFILE,
  CMD_USER_CHANGE_EMAIL,
  type GetUserByIdRequestDto,
  type LoginRequestDto,
  type RefreshTokenRequestDto,
  type RegisterRequestDto,
  type UpdateProfileRequestDto,
  type ValidateTokenRequestDto,
  type ChangePasswordRequestDto,
  type ChangeEmailRequesDto,
} from '@tms/contracts';
import { AuthService } from './auth.service.js';
import { UsersService } from './users.service.js';

@Controller()
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) { }

  @MessagePattern(CMD_AUTH_REGISTER)
  register(@Payload() dto: RegisterRequestDto) {
    return this.auth.register(dto);
  }

  @MessagePattern(CMD_AUTH_LOGIN)
  login(@Payload() dto: LoginRequestDto) {
    return this.auth.login(dto);
  }

  @MessagePattern(CMD_AUTH_VALIDATE_TOKEN)
  validateToken(@Payload() dto: ValidateTokenRequestDto) {
    return this.auth.validateToken(dto);
  }

  @MessagePattern(CMD_AUTH_REFRESH)
  refresh(@Payload() dto: RefreshTokenRequestDto) {
    return this.auth.refresh(dto);
  }

  @MessagePattern(CMD_USER_GET_BY_ID)
  async getById(@Payload() dto: GetUserByIdRequestDto) {
    const user = await this.users.findById(dto.userId);
    if (!user) return null;
    return this.users.toPublic(user);
  }

  @MessagePattern(CMD_USER_UPDATE_PROFILE)
  async updateProfile(@Payload() dto: UpdateProfileRequestDto) {
    const user = await this.users.updateProfile(dto);
    return this.users.toPublic(user);
  }

  @MessagePattern(CMD_USER_CHANGE_PASSWORD)
  changePassword(@Payload() dto: ChangePasswordRequestDto) {
    return this.auth.changePassword(dto);
  }

  @MessagePattern(CMD_USER_CHANGE_EMAIL)
  changeEmail(@Payload() dto: ChangeEmailRequesDto) {
    return this.auth.changeEmail(dto);
  }
}