import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createAccountUsage, shareCodeForEmail, type UsageAccount } from "./account-usage.ts";

describe("账号的使用机会", () => {
  it("新账号是 10 次", () => {
    const usage = createAccountUsage();
    const created = usage.register({ email: "new@example.com" });
    assert.equal(created.ok, true);
    assert.equal(created.shareApplied, false);
    assert.equal(created.credits, 10);
    assert.equal(usage.credits("new@example.com"), 10);
  });

  it("没有次数记录的老账号从 10 次起算", () => {
    const existing: UsageAccount = {
      id: 7,
      email: "old@example.com",
      credits: null,
      shareCode: null,
      shareClaimed: false,
    };
    const usage = createAccountUsage([existing]);
    assert.equal(usage.credits("old@example.com"), 10);
    const spent = usage.optimize("old@example.com", true);
    assert.equal(spent.credits, 9);
  });

  it("优化成功变成 9 次，失败仍是 10 次，0 次时优化被拒绝且仍是 0", () => {
    const usage = createAccountUsage();
    usage.register({ email: "writer@example.com" });

    const failed = usage.optimize("writer@example.com", false);
    assert.equal(failed.ok, false);
    assert.equal(failed.rejected, false);
    assert.equal(failed.deducted, false);
    assert.equal(failed.credits, 10);
    assert.equal(usage.credits("writer@example.com"), 10);

    const succeeded = usage.optimize("writer@example.com", true);
    assert.equal(succeeded.ok, true);
    assert.equal(succeeded.deducted, true);
    assert.equal(succeeded.credits, 9);
    assert.equal(usage.credits("writer@example.com"), 9);

    while ((usage.credits("writer@example.com") ?? 0) > 0) {
      usage.optimize("writer@example.com", true);
    }
    assert.equal(usage.credits("writer@example.com"), 0);

    const blocked = usage.optimize("writer@example.com", true);
    assert.equal(blocked.ok, false);
    assert.equal(blocked.rejected, true);
    assert.equal(blocked.deducted, false);
    assert.equal(blocked.credits, 0);
    assert.equal(usage.credits("writer@example.com"), 0);
  });

  it("有效分享码注册后，新账号是 20 次，分享者在原次数上加 10", () => {
    const usage = createAccountUsage();
    usage.register({ email: "referrer@example.com" });
    assert.equal(usage.credits("referrer@example.com"), 10);
    const code = usage.shareCode("referrer@example.com");
    assert.equal(usage.shareCode("referrer@example.com"), code);
    assert.equal(usage.credits("referrer@example.com"), 10);

    const created = usage.register({ email: "friend@example.com", shareCode: code });
    assert.equal(created.ok, true);
    assert.equal(created.shareApplied, true);
    assert.equal(created.credits, 20);
    assert.equal(usage.credits("friend@example.com"), 20);
    assert.equal(usage.credits("referrer@example.com"), 20);
  });

  it("两个新用户用同一分享码注册，分享者加 20，每个新用户各是 20", () => {
    const usage = createAccountUsage();
    usage.register({ email: "referrer@example.com" });
    const code = usage.shareCode("referrer@example.com");

    const first = usage.register({ email: "one@example.com", shareCode: code });
    const second = usage.register({ email: "two@example.com", shareCode: code });
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    assert.equal(first.credits, 20);
    assert.equal(second.credits, 20);
    assert.equal(usage.credits("one@example.com"), 20);
    assert.equal(usage.credits("two@example.com"), 20);
    assert.equal(usage.credits("referrer@example.com"), 30);
  });

  it("空码、错码、自己的码、已经有账号的邮箱，都不给额外次数", () => {
    const usage = createAccountUsage();
    usage.register({ email: "referrer@example.com" });
    const referrerCode = usage.shareCode("referrer@example.com");

    const empty = usage.register({ email: "empty@example.com", shareCode: "   " });
    assert.equal(empty.ok, true);
    assert.equal(empty.shareApplied, false);
    assert.equal(empty.message, undefined);
    assert.equal(empty.credits, 10);
    assert.equal(usage.credits("empty@example.com"), 10);
    assert.equal(usage.credits("referrer@example.com"), 10);

    const wrong = usage.register({ email: "wrong@example.com", shareCode: "not-a-code" });
    assert.equal(wrong.ok, true);
    assert.equal(wrong.shareApplied, false);
    assert.equal(wrong.credits, 10);
    assert.match(wrong.message || "", /没有用上/);
    assert.equal(usage.credits("wrong@example.com"), 10);
    assert.equal(usage.credits("referrer@example.com"), 10);

    const ownEmail = "self@example.com";
    const own = usage.register({ email: ownEmail, shareCode: shareCodeForEmail(ownEmail) });
    assert.equal(own.ok, true);
    assert.equal(own.shareApplied, false);
    assert.equal(own.credits, 10);
    assert.match(own.message || "", /没有用上/);
    assert.equal(usage.credits(ownEmail), 10);
    assert.equal(usage.credits("referrer@example.com"), 10);

    usage.register({ email: "taken@example.com" });
    const again = usage.register({ email: "taken@example.com", shareCode: referrerCode });
    assert.equal(again.ok, false);
    assert.equal(again.shareApplied, false);
    assert.equal(again.credits, 10);
    assert.equal(usage.credits("taken@example.com"), 10);
    assert.equal(usage.credits("referrer@example.com"), 10);
  });

  it("已经注册过的人不能再领一次", () => {
    const usage = createAccountUsage();
    usage.register({ email: "referrer@example.com" });
    usage.register({ email: "other@example.com" });
    const firstCode = usage.shareCode("referrer@example.com");
    const secondCode = usage.shareCode("other@example.com");

    const claimed = usage.register({ email: "new@example.com", shareCode: firstCode });
    assert.equal(claimed.ok, true);
    assert.equal(claimed.credits, 20);
    assert.equal(usage.credits("referrer@example.com"), 20);

    const repeat = usage.register({ email: "new@example.com", shareCode: secondCode });
    assert.equal(repeat.ok, false);
    assert.equal(repeat.shareApplied, false);
    assert.equal(usage.credits("new@example.com"), 20);
    assert.equal(usage.credits("other@example.com"), 10);
    assert.equal(usage.credits("referrer@example.com"), 20);
  });
});
