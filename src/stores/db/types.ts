export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  drivingLicense: boolean;
  note: string | null;
  adminNote: string | null;
  role: RoleEnum;
  avatarUrl: string | null;
  activatedAccount: boolean;
  deactivated: boolean;
  _count: {
    supervisedExams: number;
    invigilatedExams: number;
    examinedExams: number;
  };
  supervisedExams: Exam[];
  invigilatedExams: Exam[];
  examinedExams: Exam[];
  responses: Response[];

  isRoleChanged?: boolean;
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
  location: string;
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

export interface ExamWithVenueLink extends Exam {
  venueLink: string;
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

export interface dayResponse {
  dayOfExamsId: number;
  id : number;
  response : string;
  userName : string;
  userRole : string;
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

export interface Venue {
  id: number;
  name: string;
  locationId: number;
  gLink: string;
}

export interface Location {
  id: number;
  name: string;
  venues: Venue[];
}

export interface Post {
  id?: number;
  title: string;
  body: string;
  roles?: RoleEnum[],
  users?: User[],
  links: DriveLink[];
}

export interface DriveLink{
  id?: number;
  link: string;
  name: string;
  postId?: number;
}

