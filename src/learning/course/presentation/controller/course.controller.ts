import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { CourseService } from '../../application/course.service';
import {
  AddPriceDTO,
  CreateCourseDto,
  updateCourseStatusDto,
} from '../dto/create-course.dto';
import { Auth } from 'src/common/decorators/decomposition.decorater';
import { UserRoles } from 'src/common/enum';
import type { Request } from 'express';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Auth(UserRoles.INSTRUCTOR)
  @Post('draft')
  async saveAsDraft(@Body() dto: CreateCourseDto, @Req() req: Request) {
    const course = await this.courseService.saveAsDraft(dto, req.user.id);
    return {
      success: true,
      message: 'Course Cretaed Successfully',
      course,
    };
  }

  @Auth(UserRoles.INSTRUCTOR)
  @Patch(':courseId/price')
  addPrice(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: AddPriceDTO,
    @Req() req: Request,
  ) {
    return this.courseService.addPrice(req.user.id, courseId, dto);
  }

  @Auth(UserRoles.INSTRUCTOR)
  @Post(':courseId/send-for-review')
  sendCourseForReview(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req: Request,
  ) {
    return this.courseService.sendCourseForReview(courseId, req.user.id);
  }

  @Auth(UserRoles.ADMIN)
  @Patch(':courseId/status')
  updateCourseStatus(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: updateCourseStatusDto,
    @Req() req: Request,
  ) {
    return this.courseService.updateCourseStatus(req.user.id, dto);
  }

  @Get('published')
  getAllPublishedCourses(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.courseService.getAllPublishedCourses(page, limit);
  }

  @Auth(UserRoles.INSTRUCTOR)
  @Get('instructor')
  getCoursesByInstructer(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(4), ParseIntPipe) limit: number,
    @Req() req: Request,
  ) {
    return this.courseService.getCoursesByInstructer(page, limit, req.user.id);
  }

  @Auth(UserRoles.USER)
  @Get(':courseId/preview')
  getCoursePreview(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req: Request,
  ) {
    return this.courseService.getCoursePreview(courseId, req.user.id);
  }

  @Auth(UserRoles.USER)
  @Post(':courseId/progress/verify')
  verifyProgress(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req: Request,
  ) {
    return this.courseService.verifyCourseStudentCompleted(
      courseId,
      req.user.id,
    );
  }

  @Auth(UserRoles.INSTRUCTOR)
  @Delete(':courseId')
  deleteCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req: Request,
  ) {
    return this.courseService.deleteCourse(courseId, req.user.id);
  }

  @Post()
  async allCourses() {
    const courses = await this.courseService.getAllCoursesToHome();

    return {
      success: true,
      courses,
    };
  }
}
