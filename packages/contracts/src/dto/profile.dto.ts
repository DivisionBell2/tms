export interface GetUserByIdRequestDto {
    userId: string;
  }
  
  export interface UpdateProfileRequestDto {
    userId: string;
    displayName?: string;
    avatarFileId?: string | null;
  }