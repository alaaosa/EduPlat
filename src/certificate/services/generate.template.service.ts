import { Injectable, NotFoundException } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { Browser } from 'puppeteer';
import { BrowserService } from './browser.service';
import { CertificateType } from 'src/learning/course/domain/enums';
import { CourseRepository } from 'src/learning/course/infrastructure/persistence/sequelize/course.repo';
import { OnEvent } from '@nestjs/event-emitter';

interface IData {
  success: boolean;
  studentName: string;
  courseName: string;
  instructorName: string;
  numOfHours: number;
}

@Injectable()
export class GenerateTemplateService {
  constructor(
    // private readonly courseRepo: CourseRepository,
    private readonly browserService: BrowserService,
  ) {}

  @OnEvent('assessmentGraded')
  async generateCertificateTemplate(
    data: IData,
    // certificateType: CertificateType,
    // courseId: number,
  ) {
    if (data.success == false) {
      return this.generatePdf('certificate_attendance.html', data);
    }

    if (data.success == true) {
      return this.generatePdf('certificate_completion.html', data);
    }

    throw new NotFoundException('Invalid certificate type');
  }

  private async generatePdf(
    templateFile: string,
    details: IData,
  ): Promise<Buffer> {
    const browser = (await this.browserService.getInstance()) as Browser;
    const page = await browser.newPage();
    const { success, ...data } = details;
    try {
      const filePath = path.join(__dirname, '../template', templateFile);
      const html = fs.readFileSync(filePath, 'utf-8');
      const template = Handlebars.compile(html);

      const finalHtml = template({
        ...data,
        date: new Date().toLocaleDateString(),
      });

      await page.setContent(finalHtml, { waitUntil: 'domcontentloaded' });
      await page.waitForNetworkIdle();
      return Buffer.from(
        await page.pdf({ format: 'A4', printBackground: true }),
      );
    } finally {
      await page.close();
    }
  }
}
