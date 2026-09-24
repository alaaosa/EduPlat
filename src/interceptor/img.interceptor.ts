import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { randomUUID } from 'crypto';
import { unlink } from 'fs/promises';
import sharp from 'sharp';
import { catchError, finalize, from, mergeMap, throwError } from 'rxjs';

import { CloudinaryService } from './service/cloudinary.service';
import { UserRepository } from 'src/user/repo/user';

@Injectable()
export class CloudinaryInterceptor implements NestInterceptor {
  constructor(
    private cloudinaryService: CloudinaryService,
    private reflector: Reflector,
    private readonly userRepository: UserRepository,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const request = context.switchToHttp().getRequest();

    const file = request.file as Express.Multer.File;

    if (!file) throw new NotFoundException('No file uploaded');

    const folder = this.reflector.get('folder', context.getHandler());
    if (!folder)
      throw new BadRequestException('Cloudinary folder is not configured');

    const finalFolder = `${folder}/${request.user.id}`;
    let publicId: string;
    const user = await this.userRepository.findPublicId(request.user.id);

    if (!user) throw new BadRequestException('user not found');
    publicId = user.profilePictureId;

    if (!publicId) {
      publicId = randomUUID();
    }
    try {
      // Validate + process the actual uploaded image
      const processedImage = await sharp(file.path)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 90 })
        .toBuffer();

      // Upload the processed image to Cloudinary
      const content = await this.cloudinaryService.upload(
        processedImage,
        finalFolder,
        publicId,
      );

      request.body.image = {
        url: content.secure_url,
        public_id: content.public_id,
      };

      return next.handle().pipe(
        catchError((err) =>
          from(this.cloudinaryService.delete(content.public_id)).pipe(
            mergeMap(() => throwError(() => err)),
            catchError(() => throwError(() => err)),
          ),
        ),

        // Delete temporary Multer file
        finalize(() => {
          unlink(file.path).catch(() => undefined);
        }),
      );
    } catch (error) {
      // Delete temporary file if Sharp or Cloudinary fails
      await unlink(file.path).catch(() => undefined);

      throw error;
    }
  }
}
