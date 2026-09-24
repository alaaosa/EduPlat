import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global()
@Module({
  controllers: [],
  providers: [RedisService],
})
export class RedisModule {}
