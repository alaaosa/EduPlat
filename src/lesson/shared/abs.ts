import { ILesson } from './interface/lesson';

export abstract class AbstractLesson implements ILesson {
  abstract create(lessonId: number, dto: any): Promise<any>;
}
