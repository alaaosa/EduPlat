import { Module } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { CertificateController } from './certificate.controller';
import { GenerateTemplateService } from './services/generate.template.service';
import { BrowserService } from './services/browser.service';

@Module({
  controllers: [CertificateController],
  providers: [CertificateService , GenerateTemplateService , BrowserService],
})
export class CertificateModule {}
