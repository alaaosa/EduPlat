export interface IPushCourseEvent {
  emit(name: string, data: unknown): void;
}
