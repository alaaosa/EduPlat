import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { FinalService } from './final.service';
import { CreateFinalDto } from './dto/create-final.dto';
import { Auth } from 'src/common/decorators/decomposition.decorater';
import { UserRoles } from 'src/common/enum';

@Controller('final')
export class FinalController {
  constructor(private readonly finalService: FinalService) {}

  @Auth(UserRoles.INSTRUCTOR)
  @Post('course/:courseId')
  create(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: CreateFinalDto,
  ) {
    return this.finalService.create(dto, courseId);
  }
}
