export class CourseDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CourseDomainError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
