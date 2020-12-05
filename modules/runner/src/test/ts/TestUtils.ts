export const range = <T>(count: number, fn: (idx: number) => T): T[] => {
  const r: T[] = [];
  for (let i = 0; i < count; i++) {
    r.push(fn(i));
  }
  return r;
};