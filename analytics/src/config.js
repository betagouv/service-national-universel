const ENVIRONMENT = process.env.DEV ? "development" : "production";
const PORT = process.env.PORT || 8085;
const POSTGRESQL = process.env.POSTGRESQL;

module.exports = {
  PORT,
  POSTGRESQL,
  ENVIRONMENT,
};
