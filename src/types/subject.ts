export interface ISubject {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface ICreateAndUpdateSubjectRequest {
  name: string;
  description?: string;
}
