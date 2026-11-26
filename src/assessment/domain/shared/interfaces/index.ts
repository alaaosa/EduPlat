import { ExamTypes } from '../enum/types-of-exam';

export interface ExamGradedEventData {
  idempotency_key: string;
  studentName: string;
  examId: number;
  type: ExamTypes;
  isPassed: boolean;
  score: number;
  userId : number
}
