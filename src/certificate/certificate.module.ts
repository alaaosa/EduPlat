import { Module } from '@nestjs/common';
import { GenerateTemplateService } from './services/generate.template.service';
import { BrowserService } from './services/browser.service';

@Module({
  providers: [GenerateTemplateService, BrowserService],
})
export class CertificateModule {}
