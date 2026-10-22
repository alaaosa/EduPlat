import { Module } from '@nestjs/common';
import { InstructerService } from './instructer.service';
import { InstructerController } from './instructer.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Instructer } from './entities/instructer';
import { InstructerRepository } from './repo/instructor';
import { HandleException } from '../db/db.service';

@Module({
  imports: [SequelizeModule.forFeature([Instructer])],
  controllers: [InstructerController],
  providers: [InstructerService, InstructerRepository, HandleException],
  exports: [InstructerRepository],
})
export class InstructerModule {}
