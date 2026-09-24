import { SetMetadata } from '@nestjs/common';

export const Folder = (folderName: string) => {
  return SetMetadata('folder', folderName);
};
