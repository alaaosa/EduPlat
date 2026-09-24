import { Injectable } from '@nestjs/common';

import cloudinary from '../../common/config/cloudinary';
import { DeleteApiResponse, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async upload(
    file: Buffer,
    folder: string,
    public_id: string,
  ): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          overwrite: true,
          public_id,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) throw new Error('Cloudinary upload failed');

          resolve(result);
        },
      );

      uploadStream.end(file);
    });
  }

  // async uploadMultiple(files: Buffer[], folder: string) {
  //   const uploadPromises = files.map((file) =>
  //     new Promise((resolve, reject) => {
  //       const uploadStream = cloudinary.uploader.upload_stream(
  //         {
  //           folder,
  //           resource_type: 'image',
  //         },
  //         (error, result) => {
  //           if (error) {
  //             reject(error);
  //             return;
  //           }
  //
  //           resolve(result);
  //         },
  //       );
  //
  //       uploadStream.end(file);
  //     }),
  //   );
  //
  //   return Promise.all(uploadPromises);
  // }

  async delete(public_id: string) : Promise<DeleteApiResponse> {
    const res = await cloudinary.uploader.destroy(public_id);

    return res;
  }

  private async deleteFolderResources(path: string) {
    await cloudinary.api.delete_resources_by_prefix(path);
  }

  async deleteFolder(path: string) {
    await this.deleteFolderResources(path);

    await cloudinary.api.delete_folder(path);
  }
}
