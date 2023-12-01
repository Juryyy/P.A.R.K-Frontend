export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

//Number of csv column in the file
export type Candidate = {
  id: number;
  Level: string; //1
  DateOfExam: Date; //2
  Location: string; //3
  Venue?: string; //4
  CandidateId?: number | null; //5
  TypeOfExam: string; //6
  FirstName: string; //7
  LastName: string; //7
  BirthDate: Date; //8
  Email: string;  //9
  Phone: string; //10
  Code: string; //11
  Partner?: string; //12
  Mock: boolean; //13
  Paid: boolean; //14
  OrderId: number; //14
  Requirements: string; //15
  CrfToSchool: boolean; //16
  Note: string; //17
}
