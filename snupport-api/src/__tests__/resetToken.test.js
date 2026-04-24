const { hashResetToken } = require("../utils/resetToken");

describe("reset token hashing", () => {
  it("should return a 64-hex sha256 hmac", () => {
    const token = "a".repeat(40);
    const secret = "unit-test-secret";
    const hash = hashResetToken({ token, secret });
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("should be deterministic for same inputs", () => {
    const token = "deadbeef";
    const secret = "unit-test-secret";
    expect(hashResetToken({ token, secret })).toBe(hashResetToken({ token, secret }));
  });
});

