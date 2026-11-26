import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { CourseDomainError } from './course-domain.error';

@Catch(CourseDomainError)
export class CatchCourseErrors implements ExceptionFilter {
  catch(exception: CourseDomainError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
      error: exception.name,
    });
  }
}
