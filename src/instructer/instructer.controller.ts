import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InstructerService } from './instructer.service';
import { CreateInstructerDto } from './dto/create-instructer.dto';

@Controller('instructer')
export class InstructerController {
  constructor(private readonly instructerService: InstructerService) {}

  
}
