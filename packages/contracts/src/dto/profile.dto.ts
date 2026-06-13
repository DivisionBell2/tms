export interface GetUserByIdRequestDto {
    userId: string;
  }
  
  export interface UpdateProfileRequestDto {
    userId: string;
    displayName?: string;
    avatarFileId?: string | null;
  }

  export interface ChangePasswordRequestDto {
    userId: string;
    currentPassword: string;
    newPassword: string;
  }

  export interface ChangeEmailRequesDto {
    userId: string;
    password: string;
    newEmail: string;
  }