export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    drivingLicense: boolean;
    note: string | null;
    adminNote: string | null;
    role: RoleEnum;
    avatarUrl: string | null;
    activatedAccount: boolean;
    deactivated: boolean;
}

export interface UserInfo {
    id: number | undefined;
    email: string | undefined;
    firstName: string | undefined;
    lastName: string | undefined;
    drivingLicense: boolean | undefined;
    note: string | undefined;
    adminNote: string | undefined;
    role: RoleEnum | undefined;
    avatarUrl: string | undefined;
    activatedAccount: boolean | undefined;
    deactivated: boolean | undefined;
}

export enum RoleEnum {
  Office,
  Supervisor,
  SeniorSupervisor,
  Invigilator,
  SeniorInvigilator,
  Tech,
  Examiner,
  test
}
