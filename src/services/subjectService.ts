import { apiClient } from "../api/client";
import type {
  ICreateAndUpdateSubjectRequest,
  ISubject,
} from "../types/subject";
import { v4 as uuidv4 } from "uuid";

export const getSubjects = async () => {
  const response = await apiClient.get<ISubject[]>("/subjects");
  return response.data;
};

export const getSubjectById = async (id: string) => {
  const response = await apiClient.get<ISubject>(`/subjects/${id}`);
  return response.data;
};

export const createSubject = async (
  subject: ICreateAndUpdateSubjectRequest,
) => {
  const name = subject.name.trim();

  if (!name) {
    throw new Error("Subject name is required");
  }

  const newSubject: ISubject = {
    id: uuidv4(),
    name,
    description: subject.description?.trim(),
    createdAt: new Date().toISOString(),
  };
  const response = await apiClient.post<ISubject>("/subjects", newSubject);
  return response.data;
};

export const updateSubject = async (
  id: string,
  subject: ICreateAndUpdateSubjectRequest,
) => {
  const name = subject.name.trim();

  if (!name) {
    throw new Error("Subject name is required");
  }

  const updatedData: ICreateAndUpdateSubjectRequest = {
    name,
    description: subject.description?.trim(),
  };
  const response = await apiClient.patch<ISubject>(
    `/subjects/${id}`,
    updatedData,
  );
  return response.data;
};

export const deleteSubject = async (id: string) => {
  const [topicsResponse, questionsResponse] = await Promise.all([
    apiClient.get("/topics", {
      params: { subjectId: id },
    }),
    apiClient.get("/questions", {
      params: { subjectId: id },
    }),
  ]);

  if (topicsResponse.data.length > 0 || questionsResponse.data.length > 0) {
    throw new Error("Cannot delete a subject that has topics or questions.");
  }

  await apiClient.delete(`/subjects/${id}`);
};
