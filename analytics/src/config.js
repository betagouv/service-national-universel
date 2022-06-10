const ENVIRONMENT = process.env.DEV ? "development" : "production";
const PORT = process.env.PORT || 3003;
const MONGO_NAME = process.env.MONGO_NAME;
const MONGO_URL = process.env.MONGO_URL;
const POSTGRESQL = process.env.POSTGRESQL;

module.exports = {
  PORT,
  POSTGRESQL,
  ENVIRONMENT,
  MONGO_NAME,
  MONGO_URL,
};
