export class InvalidCouponError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCouponError';
  }
}
