import { Module } from '@nestjs/common';
import { MeilisearchService } from './meilisearch.service';
import { MeilisearchController } from './meilisearch.controller';

@Module({
  controllers: [MeilisearchController],
  providers: [MeilisearchService],
  exports: [MeilisearchService],
})
export class MeilisearchModule {}
