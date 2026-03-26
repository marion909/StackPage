// Simple nanoid-compatible unique ID generator (no external dep needed)
let counter = 0;
export function nanoid(size = 21): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
  const arr = new Uint8Array(size);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => chars[b % chars.length]).join("") + (counter++).toString(36);
}
