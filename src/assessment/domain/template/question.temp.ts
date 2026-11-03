import { QuestionTypes } from '../shared/enum/types-of-questions';

export type QuestionTemp = {
  question: string;
  questionType: QuestionTypes;
  answers: { answer: string; isCorrect?: boolean }[];
}[];

export type ExamQuestions = {
  id: number;
  // question: string;
  answerId: number;
}[];
export type StudentAnswers = {
  id: number;
  answerId: number;
}[];
