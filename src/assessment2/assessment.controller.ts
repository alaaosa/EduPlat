import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { IsEnum, IsInt } from 'class-validator';
import type { Request } from 'express';
import { AssessmentService } from './assessment.service';
import { examType } from './models/MCQ&TF/question';
import { Auth } from 'src/common/decorators/decomposition.decorater';
import { UserRoles } from 'src/common/enum';
import { choiceDto } from './dto/mcq&tf';

class StartAssessmentDto {
  @IsEnum(examType)
  type!: examType;

  @IsInt()
  assessmentId!: number;
}

@Controller('assessment')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Auth(UserRoles.USER)
  @Post('start')
  start(@Body() dto: StartAssessmentDto, @Req() req: Request) {
    if (!req.user) throw new ForbiddenException('Authentication required');
    return this.assessmentService.startAssessment(
      dto.type,
      dto.assessmentId,
      req.user,
    );
  }

  @Auth(UserRoles.USER)
  @Get(':type/:assessmentId/result')
  async result(
    @Param('type') type: examType,
    @Param('assessmentId', ParseIntPipe) assessmentId: number,
    @Req() req: Request,
  ) {
    const result = await this.assessmentService.getResult(
      assessmentId,
      type,
      req.user.id,
    );
    return result;
  }

  @Auth(UserRoles.USER)
  @Patch(':type/:assessmentId/attempts/:attemptId/answer')
  saveAnswer(
    @Param('attemptId', ParseIntPipe) attemptId: number,
    @Body() answer: choiceDto,
    @Req() req: Request,
  ) {
    return this.assessmentService.saveAnswer(attemptId, req.user.id, answer);
  }

  @Auth(UserRoles.USER)
  @Post(':type/:assessmentId/attempts/:attemptId/submit')
  submit(
    @Param('type') type: examType,
    @Param('assessmentId', ParseIntPipe) assessmentId: number,
    @Param('attemptId', ParseIntPipe) attemptId: number,
    @Req() req: Request,
  ) {
    return this.assessmentService.submitAssessment(
      assessmentId,
      attemptId,
      req.user,
      type,
    );
  }
}
