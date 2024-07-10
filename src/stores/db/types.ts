export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  drivingLicense: boolean;
  note: string | null;
  adminNote: string | null;
  role: RoleEnum[];
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
  isSenior: boolean;
  isRoleChanged?: boolean;
}

export interface UserInfo {
  id: number | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  drivingLicense: boolean | null;
  note: string | null;
  adminNote: string | null;
  role: string[] | null;
  avatarUrl: string | null;
  activatedAccount: boolean | null;
  deactivated: boolean | null;
  isSenior: boolean | null;
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
  Invigilator = 'Invigilator',
  Technician = 'Technician',
  Examiner = 'Examiner',
}

export interface ExtendedUser extends User {
  originalRoles: RoleEnum[];
  isRoleChanged: boolean;
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
  userRole : string[];
  assigned: boolean;
  userId: number;
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
  content: string;
  authorId?: number;
  author?: User;
  createdAt?: Date;
  updatedAt?: Date;
  taggedRoles?: RoleEnum[],
  users?: User[],
  driveLink: DriveLink[];
}

export interface DriveLink{
  id?: number;
  link: string;
  name: string;
  postId?: number;
}

