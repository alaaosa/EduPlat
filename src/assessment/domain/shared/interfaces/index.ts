import { ExamTypes } from '../enum/types-of-exam';

export interface ExamGradedEvent {
  idempotency_key: string;
  studentName: string;
  examId: number;
  type: ExamTypes;
  isPassed: boolean;
  score: number;
}
