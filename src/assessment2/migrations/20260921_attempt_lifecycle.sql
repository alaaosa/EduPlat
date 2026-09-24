/*
  Assessment lifecycle schema migration for SQL Server.
  Run through the deployment migration process before deploying the code that
  requires durable attempt expiry and answer revisions.
*/

ALTER TABLE attempts ADD startedAt DATETIME2 NULL;
ALTER TABLE attempts ADD expiresAt DATETIME2 NULL;
ALTER TABLE student_answers ADD revision INT NOT NULL CONSTRAINT DF_student_answers_revision DEFAULT 0;

/* Existing active attempts have no reliable historical deadline. Expire them
   rather than silently granting extra time; completed rows retain audit times. */
UPDATE attempts SET startedAt = COALESCE(createdAt, SYSUTCDATETIME()) WHERE startedAt IS NULL;
UPDATE attempts
  SET expiresAt = CASE
    WHEN status = 'in_progress' THEN SYSUTCDATETIME()
    ELSE COALESCE(updatedAt, createdAt, SYSUTCDATETIME())
  END
  WHERE expiresAt IS NULL;

ALTER TABLE attempts ALTER COLUMN startedAt DATETIME2 NOT NULL;
ALTER TABLE attempts ALTER COLUMN expiresAt DATETIME2 NOT NULL;

DROP INDEX IF EXISTS attempts_assessment_id_user_id ON attempts;
CREATE UNIQUE INDEX attempts_exam_type_assessment_id_user_id
  ON attempts (examType, assessmentId, userId);
