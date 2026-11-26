import { Injectable } from '@nestjs/common';
import EventEmitter2 from 'eventemitter2';
import { CourseEvents } from '../../domain/interface/course,events';
import { IPushCourseEvent } from '../../domain/interface/event.emitter';

@Injectable()
export class PushCourseEvent implements IPushCourseEvent{
  constructor(private readonly event_emitter: EventEmitter2) {}

  emit<K extends keyof CourseEvents>(name: K, data: CourseEvents[K]): void {
    this.event_emitter.emit(name, data);
  }
}
