// require('dotenv').config();

// const { Pool } = require("pg");

// console.log(`Connecting to DB: ${PG_URL}`);

// const client = new Pool({ connectionString: PG_URL });

// module.exports = client;

const {
  PG_PORT,
  PROXY_PORT,
  ZAMMAD_SERVER_HOST,
  ZAMMAD_SERVER_USER,
  PRIVATE_KEY_PATH,
  ZAMMAD_DB_USER,
  ZAMMAD_DB_PASSWORD,
} = require("../config");

const pg = require("pg");
const SSH2Promise = require("ssh2-promise");

const pgHost = "localhost";
const pgPort = PG_PORT;
const proxyPort = PROXY_PORT;
let ready = false;

const proxy = require('net').createServer(function (sock) {
  if (!ready)
    return sock.destroy();
  c.forwardOut(sock.remoteAddress, sock.remotePort, pgHost, pgPort, function (err, stream) {
    if (err)
      return sock.destroy();
    sock.pipe(stream);
    stream.pipe(sock);
  });
});
proxy.listen(proxyPort, '127.0.0.1');

const c = new SSH2Promise();
(async function () {
  await c.connect({
    host: `${ZAMMAD_SERVER_HOST}`,
    port: 22,
    username: `${ZAMMAD_SERVER_USER}`,
    privateKey: require('fs').readFileSync(`${PRIVATE_KEY_PATH}`)
  });
})();

(async function () {
  await c.on('connect', function () {
    console.log('Connection :: connect');
  });
})();

(async function () {
  await c.on('ready', function () {
    ready = true;
    const conString = `postgres://${ZAMMAD_DB_USER}:${ZAMMAD_DB_PASSWORD}@127.0.0.1:` + proxyPort + '/postgres',
      client = new pg.Client(conString);
    client.connect(function (err) {
      console.log("Connected");
      console.log(err);
    });
  });
})();

module.exports = c;
