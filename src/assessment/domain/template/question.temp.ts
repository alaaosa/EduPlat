import { QuestionTypes } from '../enum/types-of-questions';

export type QuestionTemp = {
  question: string;
  questionType: QuestionTypes;
  answers: { answer: string; isCorrect?: boolean }[];
}[];

export type ExamQuestions = {
  id: number;
  question: string;
  answer: { id: number };
}[];
export type StudentAnswers = {
  id: number;
  answer: { id: number };
}[];
