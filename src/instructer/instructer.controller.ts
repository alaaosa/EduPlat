import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { InstructerService } from './instructer.service';
import { Auth } from 'src/common/decorators/decomposition.decorater';
import { UserRoles } from 'src/common/enum';
import type { Request } from 'express';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { InstructerInterceptor } from 'src/interceptor/instructer.interceptor';
import { CreateInstructerDTO } from './dto/instructor.dto';
import { multerOptions, verifcation } from 'src/common/utils/multer';

@Controller('instructer')
export class InstructerController {
  constructor(private readonly instructerService: InstructerService) {}

  @Auth(UserRoles.INSTRUCTOR)
  @Get(':tab')
  getInstructerData(
    @Param('tab') tab: string,
    @Req() req: Request,
    @Param('subTab') subTab?: string,
  ) {
    return this.instructerService.getInstructerData(req.user.id, tab);
  }

  @Auth(UserRoles.USER)
  @Post('apply')
  @UseInterceptors(
    FilesInterceptor(
      'files',
      2,
      multerOptions(verifcation.files, 'this type not supported'),
    ),
    InstructerInterceptor,
  )
  apply(
    @Req() req: Request,
    @UploadedFiles()
    files: Express.Multer.File[],
    @Body() data: CreateInstructerDTO,
  ) {
    return this.instructerService.becomeInstructer(req.user.id, data);
  }
}
