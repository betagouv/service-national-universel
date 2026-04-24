const crypto = require("crypto");

function hashResetToken({ token, secret }) {
  if (!secret) {
    throw new Error("Missing secret for reset token hashing");
  }
  if (!token) {
    throw new Error("Missing token to hash");
  }
  return crypto.createHmac("sha256", secret).update(token).digest("hex");
}

module.exports = { hashResetToken };

