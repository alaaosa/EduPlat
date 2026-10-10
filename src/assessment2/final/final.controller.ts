import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common';
import { FinalService } from './final.service';
import { CreateFinalDto } from './dto/create-final.dto';
import { Auth } from 'src/common/decorators/decomposition.decorater';
import { UserRoles } from 'src/common/enum';
import type { Request } from 'express';

@Controller()
export class FinalController {
  constructor(private readonly finalService: FinalService) {}

  @Auth(UserRoles.INSTRUCTOR)
  @Post('course/:courseId/final-exam')
  async create(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: CreateFinalDto,
    @Req() req: Request,
  ) {
    const final = await this.finalService.create(dto, courseId, req.user.id);

    return {
      success: true,
      message: 'final exam created successfully',
      final,
    };
  }
}
