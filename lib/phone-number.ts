/** 腾讯云 OneID 只收国内 11 位手机号。允许用户带空格、短横线或 +86。 */

export function normalizePhone(value: string): string {
  let raw = value.trim().replace(/[\s-]/g, "");
  if (raw.startsWith("+86")) raw = raw.slice(3);
  else if (raw.startsWith("0086")) raw = raw.slice(4);
  else if (raw.startsWith("86") && raw.length === 13) raw = raw.slice(2);
  return raw;
}

export function validPhone(value: string): boolean {
  return /^1[3-9]\d{9}$/.test(value);
}
