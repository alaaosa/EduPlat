export class GamificationDomainError extends Error {
  constructor(public message: string) {
    super(message);
  }
}
