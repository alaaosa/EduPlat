import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import type { Request } from 'express';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('course')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post(':courseId/review')
  async create(
    @Req() req: Request,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() data: CreateReviewDto,
  ) {
    return this.reviewService.create(data, req.user.id, courseId);
  }

  @Get(':courseId/reviewes')
   getAllReviews(@Param('courseId', ParseIntPipe) courseId: number) {
    return  this.reviewService.getAllReview(courseId);
  }
}
