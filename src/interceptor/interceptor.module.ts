import { Global, Module } from '@nestjs/common';
import { CloudinaryInterceptor } from './img.interceptor';
import { CloudinaryService } from './service/cloudinary.service';
@Global()
@Module({
  providers: [CloudinaryInterceptor , CloudinaryService],
  exports: [CloudinaryInterceptor, CloudinaryService],
})
export class InterceptorModule {}
