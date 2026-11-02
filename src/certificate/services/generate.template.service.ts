import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { Browser } from 'puppeteer';
import { BrowserService } from './browser.service';
import { OnEvent } from '@nestjs/event-emitter';
import { ExamTypes } from 'src/assessment/domain/enum/types-of-exam';
import { RedisService } from 'src/redis/redis.service';
import { ExamRecord } from 'src/assessment/application/helpers';
import { CourseRepository } from 'src/learning/course/infrastructure/persistence/sequelize/course.repo';

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
    private readonly browserService: BrowserService,
    private readonly redisService: RedisService,
    private readonly examRecord: ExamRecord,
    private readonly courseRepo: CourseRepository,
  ) {}

  @OnEvent('exam.final.graded')
  async generateCertificateTemplate(payload: {
    idempotency_key: string;
    studentName: string;
    examId: number;
    type: ExamTypes;
    isPassed: boolean;
    score: number;
  }) {
    const result = await this.redisService.client.set(
      payload.idempotency_key,
      'true',
      'EX',
      60 * 60,
      'NX',
    );

    if (!result) return;

    const courseId = await this.examRecord.findeCourseIdBasedExamType(
      payload.type,
      payload.examId,
    );

    const course = await this.courseRepo.getInformationForCertificate(courseId);

    if (!course)
      throw new BadRequestException("can't working on your certificate");

    const data: IData = {
      success: payload.isPassed,
      courseName: course.title,
      instructorName: course.instructor.user.name,
      numOfHours: course.total_duration,
      studentName: payload.studentName,
    };

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
