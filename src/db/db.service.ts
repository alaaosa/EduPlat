import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UniqueConstraintError } from 'sequelize';

@Injectable()
export class HandleException {
  private readonly logger = new Logger('DatabaseFailure');
  async handle<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      this.logger.error("can't connect with db", error.message);
      if (error instanceof UniqueConstraintError) {
        throw new HttpException('dublicate the row', HttpStatus.CONFLICT);
      }
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }
}
