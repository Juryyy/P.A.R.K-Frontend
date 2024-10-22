export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  drivingLicense: boolean;
  note: string | null;
  noteLonger: string | null;
  adminNote: string | null;
  role: RoleEnum[];
  level: LevelEnum[];
  avatarUrl: string | null;
  activatedAccount: boolean;
  deactivated: boolean;
  dateOfBirth: string;
  responses: Response[];
  isSenior: boolean;

  supervisedExams: Exam[];
  invigilatedExams: Exam[];
  examinedExams: Exam[];
  _count: {
    supervisedExams: number;
    invigilatedExams: number;
    examinedExams: number;
  };
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
  noteLonger: string | null;
  adminNote: string | null;
  role: string[] | null;
  level: string[] | null;
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
  isLocked: boolean;
}

export interface DayOfExamsC extends DayOfExams {
  examsCount: number;
}

export interface AbsentCandidates {
  id: number | undefined;
  firstName: string;
  lastName: string;
  level: string
}

export interface userConfirmations {
  id: number;
  examId: number;
  userId: number;
  role: RoleEnum;
  isConfirmed: boolean;
  confirmedAt: Date | null | undefined;
}

export interface Exam {
  id: number;
  venue: string;
  location: string;
  type: string;
  levels: LevelEnum[];
  startTime: string;
  endTime: string;
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
  files: File[];
  isPrepared: boolean;
  isCompleted: boolean;
  schedule?: string;
  dayReportId?: number | null;
  dayReport?: DayReport | null;
  userConfirmations: userConfirmations[];
}

export interface ExamWithVenueLink extends Exam {
  venueLink: string;
}

export enum RoleEnum {
  Office = 'Office',
  Supervisor = 'Supervisor',
  Invigilator = 'Invigilator',
  Developer  = 'Developer',
  Examiner = 'Examiner',
}

export interface ExtendedUser extends User {
  originalRoles: RoleEnum[];
  isRoleChanged: boolean;
  originalLevels: LevelEnum[];
  isLevelChanged: boolean;
  isSeniorChanged: boolean;
  originalIsSenior: boolean;
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
  userNote?: string | null;
  userLevel: LevelEnum[];
}

export enum LevelEnum {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

export enum ExamTypeEnum {
  Computer = 'Computer',
  Paper = 'Paper',
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

export interface Author {
  id: number;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface Post {
  id?: number;
  title: string;
  content: string;
  authorId?: number;
  author?: Author;
  createdAt?: Date;
  updatedAt?: Date;
  taggedRoles?: RoleEnum[];
  users?: User[];
  files?: File[];
}

export interface PostWithAvatar extends Omit<Post, 'author'> {
  author: User & {
    avatarData: string | null;
  };
}

export interface File{
  id?: number;
  name: string;
  postId?: number;
  createdAt?: Date;
  authorId?: number;
  author?: User;
  post?: Post;
}

export interface DayReport{
  id: number;
  name: string;
  examId: number;
  createdAt: Date;
  authorId: number;
}
