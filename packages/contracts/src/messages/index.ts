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

export const CMD_TEST_CASE_CREATE = 'cmd.test-case.create' as const;
export const CMD_TEST_CASE_LIST = 'cmd.test-case.list' as const;

export const EVENT_TEST_CASE_CREATED = 'event.test-case.created' as const;

export const CMD_TEST_CASE_GET = 'cmd.test-case.get' as const;
export const CMD_TEST_CASE_UPDATE = 'cmd.test-case.update' as const;
export const CMD_TEST_CASE_DELETE = 'cmd.test-case.delete' as const;

export const CMD_TEST_CASE_STEP_UPSERT_MANY = 'cmd.test-case.step.upsert-many' as const;

export const CMD_TEST_CASE_TASK_CREATE = 'cmd.test-case-task.create' as const;
export const CMD_TEST_CASE_TASK_UPDATE = 'cmd.test-case-task.update' as const;
export const CMD_TEST_CASE_TASK_DELETE = 'cmd.test-case-task.delete' as const;
export const CMD_TEST_CASE_TASK_LIST = 'cmd.test-case-task.list' as  const;

export const CMD_TEST_CASE_SECTION_CREATE = 'cmd.test-case-section.create' as const;
export const CMD_TEST_CASE_SECTION_LIST = 'cmd.test-case-section.list' as const;
export const CMD_TEST_CASE_SECTION_SET_PIN = 'cmd.test-case-section.set-pin' as const;

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
  | typeof CMD_USER_CHANGE_EMAIL
  | typeof CMD_TEST_CASE_CREATE
  | typeof CMD_TEST_CASE_LIST
  | typeof CMD_TEST_CASE_GET
  | typeof CMD_TEST_CASE_UPDATE
  | typeof CMD_TEST_CASE_DELETE
  | typeof CMD_TEST_CASE_STEP_UPSERT_MANY
  | typeof CMD_TEST_CASE_TASK_CREATE
  | typeof CMD_TEST_CASE_TASK_UPDATE
  | typeof CMD_TEST_CASE_TASK_DELETE
  | typeof CMD_TEST_CASE_TASK_LIST
  | typeof CMD_TEST_CASE_SECTION_CREATE
  | typeof CMD_TEST_CASE_SECTION_LIST
  | typeof CMD_TEST_CASE_SECTION_SET_PIN

  export type EventPattern = typeof EVENT_TEST_CASE_CREATED;