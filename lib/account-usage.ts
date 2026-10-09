import { createHash } from "node:crypto";

export const STARTING_CREDITS = 10;
export const SHARE_BONUS = 10;
export const SHARE_CODE_UNUSED_MESSAGE = "这个分享码没有用上。账号已创建，现有 10 次使用机会。";

const SHARE_ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type UsageAccount = {
  id: number;
  email: string;
  credits: number | null;
  shareCode: string | null;
  shareClaimed: boolean;
};

export type UsageRegisterResult = {
  ok: boolean;
  status: number;
  email: string;
  credits: number;
  shareApplied: boolean;
  message?: string;
};

export type UsageOptimizeResult = {
  ok: boolean;
  rejected: boolean;
  deducted: boolean;
  credits: number;
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function cleanCode(value: string | undefined) {
  return (value ?? "").trim();
}

export function visibleCredits(account: { credits?: number | null }) {
  if (typeof account.credits === "number" && Number.isFinite(account.credits)) {
    return Math.max(0, Math.floor(account.credits));
  }
  return STARTING_CREDITS;
}

/** Stable per-account code. Not a user id, and not created until the share window asks for it. */
export function shareCodeForEmail(email: string) {
  const digest = createHash("sha256").update(`yooco-share:${normalizeEmail(email)}`).digest();
  let code = "";
  for (let index = 0; index < 8; index += 1) {
    code += SHARE_ALPHABET[digest[index] % SHARE_ALPHABET.length];
  }
  return code;
}

export function createAccountUsage(seed: UsageAccount[] = []) {
  const accounts = seed.map((account) => ({ ...account }));
  let nextId = accounts.reduce((max, account) => Math.max(max, account.id), 0) + 1;

  function find(email: string) {
    const normalized = normalizeEmail(email);
    return accounts.find((account) => account.email === normalized) ?? null;
  }

  return {
    register(input: { email: string; shareCode?: string }): UsageRegisterResult {
      const email = normalizeEmail(input.email);
      const code = cleanCode(input.shareCode);
      const existing = find(email);
      if (existing) {
        return {
          ok: false,
          status: 409,
          email,
          credits: visibleCredits(existing),
          shareApplied: false,
          message: "这个邮箱已经注册过，请直接登录。",
        };
      }

      const account: UsageAccount = {
        id: nextId,
        email,
        credits: STARTING_CREDITS,
        shareCode: null,
        shareClaimed: false,
      };
      nextId += 1;

      let shareApplied = false;
      let message: string | undefined;
      if (code) {
        const owner = accounts.find((item) => item.shareCode === code) ?? null;
        const self = code === shareCodeForEmail(email) || owner?.email === email;
        if (self || account.shareClaimed || !owner) {
          message = SHARE_CODE_UNUSED_MESSAGE;
        } else {
          account.credits = STARTING_CREDITS + SHARE_BONUS;
          account.shareClaimed = true;
          owner.credits = visibleCredits(owner) + SHARE_BONUS;
          shareApplied = true;
        }
      }

      accounts.push(account);
      return {
        ok: true,
        status: 201,
        email,
        credits: visibleCredits(account),
        shareApplied,
        message,
      };
    },

    credits(email: string) {
      const account = find(email);
      return account ? visibleCredits(account) : null;
    },

    shareCode(email: string) {
      const account = find(email);
      if (!account) throw new Error("账号不存在");
      if (!account.shareCode) account.shareCode = shareCodeForEmail(account.email);
      return account.shareCode;
    },

    optimize(email: string, success: boolean): UsageOptimizeResult {
      const account = find(email);
      if (!account) return { ok: false, rejected: true, deducted: false, credits: 0 };
      const credits = visibleCredits(account);
      if (credits <= 0) return { ok: false, rejected: true, deducted: false, credits: 0 };
      if (!success) return { ok: false, rejected: false, deducted: false, credits };
      const next = credits - 1;
      account.credits = next;
      return { ok: true, rejected: false, deducted: true, credits: next };
    },

    snapshot() {
      return accounts.map((account) => ({ ...account }));
    },
  };
}
