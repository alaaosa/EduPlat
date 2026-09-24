import { Injectable } from '@nestjs/common';

@Injectable()
export class HandleException {
  async handle<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }
}
