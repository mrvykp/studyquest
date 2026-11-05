export interface ITopic {
  id: string;
  subjectId: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface ICreateAndUpdateTopicRequest {
  name: string;
}
