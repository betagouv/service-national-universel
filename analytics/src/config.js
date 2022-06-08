const POSTGRESQL = "";
const ENVIRONMENT = process.env.DEV ? "development" : "production";
const PORT = process.env.PORT || 3003;

module.exports = {
  PORT,
  POSTGRESQL,
  ENVIRONMENT,
};
