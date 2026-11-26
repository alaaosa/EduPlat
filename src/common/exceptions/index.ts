import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { UniqueConstraintError } from 'sequelize';
import { CourseDomainError } from 'src/learning/course/domain/exceptions/course-domain.error';

@Catch()
export class AppExceptionFilter {
  constructor(private readonly adapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.adapterHost;
    const ctx = host.switchToHttp();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      const response = exception.getResponse();
      message =
        typeof response === 'string'
          ? response
          : ((response as { message?: string }).message ?? exception.message);
    } else if (exception instanceof UniqueConstraintError) {
      statusCode = HttpStatus.CONFLICT;
      message = 'Resource already exists';
    } else if (exception instanceof CourseDomainError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = exception.message;
    }

    httpAdapter.reply(
      ctx.getResponse(),
      {
        statusCode,
        message,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}
