import {
  CallHandler,
  Catch,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { catchError, Observable } from 'rxjs';
import { CloudinaryService } from './service/cloudinary.service';

@Injectable()
export class InstructerInterceptor implements NestInterceptor {
  constructor(private cloudinaryService: CloudinaryService) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    const instructerId = request.user.id;

    if (!instructerId) 
      throw new UnauthorizedException('Instructor ID is missing');
    

    const files = request.file as Express.Multer.File[];
    if (!files || files.length === 0)
      throw new NotFoundException('No files uploaded');

    const finalFolder = `instructer/${instructerId}`;

    try {
      const uploadedFiles = this.cloudinaryService.uploadMultipleForInstructer(
        files,
        finalFolder,
      );
      request.body.uploadedFiles = uploadedFiles;

      return next.handle().pipe(
        catchError(async (err) => {
          // Delete the uploaded files from Cloudinary if an error occurs
          await this.cloudinaryService.deleteFolder(finalFolder);
          throw err;
        }),
      );
    } catch (err) {
      await this.cloudinaryService.deleteFolder(finalFolder);
      throw err;
    }
  }
}

// ensure if the admin reject the user to become instructer that the attachments and videos on cloudinary are deleted
