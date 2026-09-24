import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {
  private readonly excludedFields = new Set(['password']);
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    return this.trimValue(value);
  }

  private trimValue(value: any, key?: string): any {
    if (key && this.excludedFields.has(key)) {
      return value;
    }

    if (typeof value === 'string') {
      return value.trim();
    }
    if (Array.isArray(value)) {
      return value.map((item) => this.trimValue(item));
    }

    // req body sent (plain obj) => Object.prototype
    if (value !== null && typeof value === 'object') {
      for (const key of Object.keys(value)) {
        value[key] = this.trimValue(value[key], key);
      }
    }

    return value;
  }
}
