import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LessonService } from './services/lesson.service';
import type { Request } from 'express';
import { Auth } from 'src/common/decorators/decomposition.decorater';
import { UserRoles } from 'src/common/enum';
import { LessonDto } from './dto/lesson.dto';
import { UserEnrolled } from 'src/common/guard/lesson.guard';
import { VideoHandler } from './services/video.service';

@Controller()
export class LessonController {
  constructor(
    private readonly lessonService: LessonService,
    private readonly videoHandler: VideoHandler,
  ) {}

  @Auth(UserRoles.USER)
  @Get('section/:sectionId')
  async getAllLessons(@Param('sectionId', ParseIntPipe) sectionId: number) {
    return this.lessonService.findLessons(sectionId);
  }

  @Auth(UserRoles.INSTRUCTOR)
  @Post('course/:courseId/section/:sectionId')
  create(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() dto: LessonDto,
  ) {
    return this.lessonService.create(courseId, sectionId, dto);
  }

  @Auth(UserRoles.INSTRUCTOR)
  @Patch('lesson/:lessonId/preview')
  updateLessonPreview(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Body('isPreview') isPreview: boolean,
    @Req() req: Request,
  ) {
    return this.lessonService.updateLessonPreview(
      lessonId,
      isPreview,
      req.user.id,
    );
  }

  // @Auth(UserRoles.USER)
  // @Get('lesson/:lessonId/video')
  // getLessonVideoPlayBackUrl(
  //   @Param('lessonId', ParseIntPipe) lessonId: number,
  //   @Req() req: Request,
  // ) {
  //   return this.lessonService.getLessonVideoPlayBackUrl(lessonId, req.user.id);
  // }

  @Auth(UserRoles.USER)
  @UseGuards(UserEnrolled)
  @Get('course/:courseId/section/:sectionId/lesson/:lessonId')
  async getLesson(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Req() req: Request,
  ) {
    const lesson = await this.lessonService.findLessonsForEnrolledUsers(
      courseId,
      sectionId,
      lessonId,
      req.user.id,
    );

    return {
      success: true,
      lesson,
    };
  }

  @Auth(UserRoles.INSTRUCTOR)
  @Post('lesson/:lessonId/upload-url')
  async uploadURl(
    @Param('lessonId', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const url = await this.videoHandler.createUrl(req.user.id, id);

    return {
      success: true,
      message: 'url created successfully',
      url,
    };
  }
}
