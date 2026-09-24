import { Module } from '@nestjs/common';
import { InstructerService } from './instructer.service';
import { InstructerController } from './instructer.controller';

@Module({
  controllers: [InstructerController],
  providers: [InstructerService],
})
export class InstructerModule {}
