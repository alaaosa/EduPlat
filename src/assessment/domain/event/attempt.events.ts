export type AttemptStarted = Readonly<{
  type: 'AttemptStarted';
  attemptId: string;
  occurredAt: Date;
}>;
export type AttemptSubmitted = Readonly<{
  type: 'AttemptSubmitted';
  attemptId: string;
  occurredAt: Date;
}>;
export type AttemptExpired = Readonly<{
  type: 'AttemptExpired';
  attemptId: string;
  occurredAt: Date;
}>;
export type AttemptAbandoned = Readonly<{
  type: 'AttemptAbandoned';
  attemptId: string;
  occurredAt: Date;
}>;
export type ExamAttemptEvent =
  AttemptStarted | AttemptSubmitted | AttemptExpired | AttemptAbandoned;
