require('dotenv').config();
const { PG_URL } = require("../config");

const { Pool } = require("pg");

console.log(`Connecting to DB: ${PG_URL}`);

const client = new Pool({ connectionString: PG_URL });

module.exports = client;
