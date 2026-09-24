import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import type { Request } from 'express';
import { Auth } from 'src/common/decorators/decomposition.decorater';
import { UserRoles } from 'src/common/enum';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  create(@Body() dto: CreateQuizDto) {
    return this.quizService.create(dto);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.quizService.findById(id);
  }

  @Auth(UserRoles.USER)
  @Get('lesson/:lessonId')
  findByLessonId(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Req() req: Request,
  ) {
    return this.quizService.findByLessonId(lessonId, req.user.id);
  }
}
