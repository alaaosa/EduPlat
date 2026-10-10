import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import multer from 'multer';

export const verifcation = {
  files: ['application/pdf'],
  images: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
  video: ['video/mp4'],
}
export const multerOptions = (
  allowed: string[],
  errorMsg: string,
): MulterOptions => {
  return {
    storage: multer.diskStorage({}),

    fileFilter: (_, file, cb) => {
      if (!allowed.includes(file.mimetype)) {
        return cb(new BadRequestException(errorMsg), false);
      }

      cb(null, true);
    },

    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  };
};
