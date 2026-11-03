export class AssessmentDomainError extends Error {
  constructor(
    message: string,
    public readonly code = 'ASSESSMENT_DOMAIN_ERROR',
  ) {
    super(message);
    this.name = 'Assessment domain error';
  }
}
