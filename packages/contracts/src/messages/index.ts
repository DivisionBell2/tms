 export const CMD_PING = 'cmd.ping' as const;

export const CMD_AUTH_REGISTER = 'cmd.auth.register' as const;
export const CMD_AUTH_LOGIN = 'cmd.auth.login' as const;
export const CMD_AUTH_VALIDATE_TOKEN = 'cmd.auth.validate-token' as const;
export const CMD_AUTH_REFRESH = 'cmd.auth.refresh' as const;

export const CMD_USER_GET_BY_ID = 'cmd.user.get-by-id' as const;
export const CMD_USER_UPDATE_PROFILE = 'cmd.user.update-profile' as const;

export const CMD_FILE_UPLOAD = 'cmd.file.upload' as const;
export const CMD_FILE_GET_META = 'cmd.file.get-meta' as const;
export const CMD_FILE_DELETE = 'cmd.file.delete' as const;

export const CMD_USER_CHANGE_PASSWORD = 'cmd.user.change-password' as const;
export const CMD_USER_CHANGE_EMAIL = 'cmd.user.change-email' as const;

export type CommandPattern =
  | typeof CMD_PING
  | typeof CMD_AUTH_REGISTER
  | typeof CMD_AUTH_LOGIN
  | typeof CMD_AUTH_VALIDATE_TOKEN
  | typeof CMD_AUTH_REFRESH
  | typeof CMD_USER_GET_BY_ID
  | typeof CMD_USER_UPDATE_PROFILE
  | typeof CMD_FILE_UPLOAD
  | typeof CMD_FILE_GET_META
  | typeof CMD_FILE_DELETE
  | typeof CMD_USER_CHANGE_PASSWORD
  | typeof CMD_USER_CHANGE_EMAIL;