export async function PromiseAll<T extends readonly unknown[]>(
  args: [...T],
): Promise<{ [K in keyof T]: Awaited<T[K]> }> {
  const result = await Promise.all(args);

  return result;
}
