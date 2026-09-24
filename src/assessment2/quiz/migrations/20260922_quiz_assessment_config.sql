/*
  Quiz-owned schema migration.
  Assessment reads `duration` as its fixed contract; this migration supplies
  that configuration without changing Assessment tables or behavior.
*/
ALTER TABLE quizzes ADD duration INT NULL;
UPDATE quizzes SET duration = 30 WHERE duration IS NULL;
ALTER TABLE quizzes ALTER COLUMN duration INT NOT NULL;

ALTER TABLE quizzes ADD CONSTRAINT CK_quizzes_duration
  CHECK (duration BETWEEN 1 AND 180);
