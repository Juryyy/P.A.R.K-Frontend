//Number of csv column in the file
export type Candidate = {
  id: number;
  level: string; //1
  dateOfExam: Date; //2
  location: string; //3
  venue?: string; //4
  candidateId?: number | null; //5
  typeOfExam: string; //6
  firstName: string; //7
  lastName: string; //7
  birthDate: Date; //8
  email: string; //9
  phone: string; //10
  code: string; //11
  partner?: string; //12
  mock: boolean; //13
  paid: boolean; //14
  orderId: number; //14
  requirements?: string; //15
  crfToSchool: boolean; //16
  note: string | null; //17
};
