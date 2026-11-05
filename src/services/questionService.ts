import { apiClient } from "../api/client";
import type {
  ICreateAndUpdateQuestionRequest,
  IQuestion,
} from "../types/questions";
import {
  validateQuestion,
  validateQuestionTopics,
} from "../utils/questionValidation";
import { getSubjectById } from "./subjectService";
import { getTopicsBySubjectId } from "./topicService";
import { v4 as uuidv4 } from "uuid";

export const getQuestions = async () => {
  const response = await apiClient.get<IQuestion[]>("/questions");
  return response.data;
};

const prepareQuestion = (
  question: ICreateAndUpdateQuestionRequest,
): ICreateAndUpdateQuestionRequest => {
  if (
    question.type === "SINGLE_CHOICE" ||
    question.type === "MULTIPLE_CHOICE"
  ) {
    return {
      ...question,
      options: question.options.map((option) => ({
        ...option,
        id: option.id || uuidv4(),
      })),
    };
  }
  return question;
};

const validateRelationships = async (
  question: ICreateAndUpdateQuestionRequest,
) => {
  const [, subjectTopics] = await Promise.all([
    getSubjectById(question.subjectId),
    getTopicsBySubjectId(question.subjectId),
  ]);

  validateQuestionTopics(question.subjectId, question.topicIds, subjectTopics);
};

export const createQuestion = async (
  question: ICreateAndUpdateQuestionRequest,
) => {
  const preparedQuestion = prepareQuestion(question);

  const validatedQuestion = validateQuestion(preparedQuestion);

  await validateRelationships(validatedQuestion);

  const now = new Date().toISOString();

  const newQuestion: IQuestion = {
    ...validatedQuestion,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };

  const response = await apiClient.post<IQuestion>("/questions", newQuestion);

  return response.data;
};

export const updateQuestion = async (
  id: string,
  question: ICreateAndUpdateQuestionRequest,
) => {
  const existingResponse = await apiClient.get<IQuestion>(`/questions/${id}`);

  const existingQuestion = existingResponse.data;

  if (existingQuestion.type !== question.type) {
    throw new Error("Cannot change the type of an existing question");
  }

  const preparedQuestion = prepareQuestion(question);

  const validatedQuestion = validateQuestion(preparedQuestion);

  await validateRelationships(validatedQuestion);

  const updatedData = {
    ...validatedQuestion,
    updatedAt: new Date().toISOString(),
  };

  const response = await apiClient.patch<IQuestion>(
    `/questions/${id}`,
    updatedData,
  );

  return response.data;
};

export const deleteQuestion = async (id: string) => {
  await apiClient.delete(`/questions/${id}`);
};
