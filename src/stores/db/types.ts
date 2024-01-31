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

  supervisedExams: Exam[];
  invigilatedExams: Exam[];
  examinedExams: Exam[];
  responses: Response[];
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
  id?: number;
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
  pdfUrl?: string | null;
  comments?: string | null;
  issues?: string | null;
  scheduleForDayId?: number | null;
  supervisors: User[];
  invigilators: User[];
  examiners: User[];
  candidates: string[];
}

export enum RoleEnum {
  Office = 'Office',
  Supervisor = 'Supervisor',
  SeniorSupervisor = 'Senior Supervisor',
  Invigilator = 'Invigilator',
  SeniorInvigilator = 'Senior Invigilator',
  Tech = 'Tech',
  Examiner = 'Examiner',
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

export interface UserResponses {
  id: number;
  response: string;
  date: string;
}

export interface UserResponsesWithType {
  id: number;
  response: string;
  date: string;
  invigilators: boolean;
  examiners: boolean;
}

export enum LevelEnum {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

export enum examTypeEnum {
  Computer = 'Computer',
  ComputerSpeaking = 'Computer Speaking',
  Paper = 'Paper',
  PaperSpeaking = 'Paper Speaking',
  Mock = 'Mock',
  Speaking = 'Speaking',
}
