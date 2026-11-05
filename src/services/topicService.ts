import { apiClient } from "../api/client";
import type { ICreateAndUpdateTopicRequest, ITopic } from "../types/topic";
import { v4 as uuidv4 } from "uuid";
import { getSubjectById } from "./subjectService";
import { getQuestions } from "./questionService";

export const getTopics = async () => {
  const response = await apiClient.get<ITopic[]>("/topics");
  return response.data;
};

export const getTopicsBySubjectId = async (subjectId: string) => {
  const response = await apiClient.get<ITopic[]>("/topics", {
    params: { subjectId },
  });

  return response.data;
};

export const createTopic = async (
  subjectId: string,
  topic: ICreateAndUpdateTopicRequest,
) => {
  const name = topic.name.trim();

  if (!name) {
    throw new Error("Topic name is required");
  }

  await getSubjectById(subjectId);

  const existingTopics = await getTopicsBySubjectId(subjectId);

  const isDuplicate = existingTopics.some(
    (existingTopic) =>
      existingTopic.name.trim().toLowerCase() === name.toLowerCase(),
  );

  if (isDuplicate) {
    throw new Error("A topic with this name already exists in this subject");
  }

  const newTopic: ITopic = {
    id: uuidv4(),
    subjectId,
    name,
    createdAt: new Date().toISOString(),
  };

  const response = await apiClient.post<ITopic>("/topics", newTopic);
  return response.data;
};

export const updateTopic = async (
  id: string,
  topic: ICreateAndUpdateTopicRequest,
) => {
  const name = topic.name.trim();

  if (!name) {
    throw new Error("Topic name is required");
  }

  const response = await apiClient.get<ITopic>(`/topics/${id}`);
  const existingTopic = response.data;

  const subjectTopics = await getTopicsBySubjectId(existingTopic.subjectId);

  const isDuplicate = subjectTopics.some(
    (t) => t.id !== id && t.name.trim().toLowerCase() === name.toLowerCase(),
  );

  if (isDuplicate) {
    throw new Error("A topic with this name already exists in this subject");
  }

  const updatedData: ICreateAndUpdateTopicRequest = {
    name,
  };

  const updatedResponse = await apiClient.patch<ITopic>(
    `/topics/${id}`,
    updatedData,
  );

  return updatedResponse.data;
};

export const deleteTopic = async (id: string) => {
  const questions = await getQuestions();

  const isTopicUsed = questions.some((question) =>
    question.topicIds.includes(id),
  );

  if (isTopicUsed) {
    throw new Error(
      "Cannot delete this topic because it is referenced by one or more questions.",
    );
  }

  await apiClient.delete(`/topics/${id}`);
};
