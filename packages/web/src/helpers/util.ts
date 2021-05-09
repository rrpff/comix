export const byKey = <T>(key: keyof T) => (a: T, b: T): number =>
  a[key] < b[key] ? -1 :
  a[key] > b[key] ? 1 :
  0
