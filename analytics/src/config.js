const ENVIRONMENT = process.env.DEV ? "development" : "production";
const PORT = process.env.PORT || 8085;
const POSTGRESQL = process.env.POSTGRESQL;
const SECRET_API_KEY = process.env.SECRET_API_KEY || "api-key";
const JWT_SECRET = process.env.JWT_SECRET || "not-so-secret";

module.exports = {
  PORT,
  POSTGRESQL,
  ENVIRONMENT,
  SECRET_API_KEY,
  JWT_SECRET,
};
