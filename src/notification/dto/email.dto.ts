export class EmailDto {
  to?: string;
  subject?: string;
  body?: string;
  template?: string;
  data?: Record<string, unknown>;
}


