export class PushDto {
  deviceToken?: string;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
}
