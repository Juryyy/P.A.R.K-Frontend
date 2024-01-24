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
    id: number | null;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    drivingLicense: boolean | null;
    note: string | null;
    adminNote: string | null;
    role: string | null;
    avatarUrl: string | null;
    activatedAccount: boolean | null;
    deactivated: boolean | null;
}

export interface DayOfExams {
    id: number;
    date: Date;
    isForInvigilators: boolean;
    isForExaminers: boolean;
}

export interface Exam {
  id: number;
  venue: string;
  type: string;
  levels: string[];
  startTime: Date;
  endTime: Date;
  note: string;
  dayOfExamsId: number;
  pdfUrl?: string;
  comments?: string;
  issues?: string;
  ScheduleForDayId?: number;
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

export interface UserResponses {
  id: number;
  response: string;
  date: string;
}

export interface UserAnswers {
  id: number;
  response: string;
}
