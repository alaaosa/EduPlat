export function TransformToArray(value: unknown) {
  if (typeof value === 'undefined') return [];

  if (typeof value === 'string') {
    const parsed = JSON.parse(value);
    const result = Array.isArray(parsed) ? parsed : [parsed];
    return result;
  }

  if (typeof value === 'object') return [value];
}
