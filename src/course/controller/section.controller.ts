import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common';
import { SectionService } from '../services/section.service';
import { Auth } from 'src/common/decorators/decomposition.decorater';
import { UserRoles } from 'src/common/enum';
import type { Request } from 'express';
import { SectionDto } from '../dto/section.dto';

@Controller('course')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Auth(UserRoles.INSTRUCTOR)
  @Post(':courseId/sections')
  async create(
    @Req() req: Request,
    @Param('courseId', ParseIntPipe) id: number,
    @Body() data: SectionDto,
  ) {
    const section = await this.sectionService.create(req.user.id, id, data);

    return {
      success: true,
      message: 'Section Created Successfully',
      section,
    };
  }
}
