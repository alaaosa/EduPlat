import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  type RawBodyRequest,
  Inject,
  ParseIntPipe,
  Headers,
} from '@nestjs/common';
import { MuxService } from './mux.service';
import { Request } from 'express';
import Mux from '@mux/mux-node';

@Controller('mux')
export class MuxController {
  constructor(
    private readonly muxService: MuxService,
    @Inject('MUX_CLIENT') private mux: Mux,
  ) {}

  @Post('upload-url/:lessonId')
  uploadURl(@Param('lessonId', ParseIntPipe) id: number) {
    return this.muxService.createUploadUrl(id);
  }

  @Get('assets/:assetId')
  getAsset(@Param('assetId') assetId: string) {
    return this.muxService.getAsset(assetId);
  }

  @Delete('assets/:assetId')
  deleteAsset(@Param('assetId') assetId: string) {
    return this.muxService.deleteAsset(assetId);
  }

  @Post('webhook')
  handleWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('mux-signature') signture: string,
  ) {
    return this.muxService.webHook(request.rawBody!, signture);
  }
}
