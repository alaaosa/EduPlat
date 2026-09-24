import { Module } from '@nestjs/common';
import { AppMongooseModule } from './mongo/mongoose.module';
import { AppSequelizeModule } from './sequelize.module';
import { MeilisearchModule } from 'src/meilisearch/meilisearch.module';

@Module({
  imports: [AppMongooseModule, AppSequelizeModule, MeilisearchModule],
  exports: [AppMongooseModule, AppSequelizeModule, MeilisearchModule],
})
export class DbModule {}
