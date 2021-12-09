require("dotenv").config({ path: "./../../.env-staging" });
var pg = require("pg"),
  { Client } = require("ssh2");
var pgHost = "localhost",
  pgPort = 5432,
  proxyPort = 9090,
  ready = false;

var proxy = require("net").createServer(function (sock) {
  if (!ready) return sock.destroy();
  c.forwardOut(sock.remoteAddress, sock.remotePort, pgHost, pgPort, function (err, stream) {
    if (err) return sock.destroy();
    sock.pipe(stream);
    stream.pipe(sock);
  });
});
proxy.listen(proxyPort, "127.0.0.1");

var c = new Client();

function clientCreated(query) {
  return new Promise((resolve, reject) => {
    c.connect({
      host: process.env.SSHHOST,
      port: 22,
      username: process.env.SSHUSER,
      // Ici il faut le contenu d'une clé privée.
      // Autrement dit il faut que le compte soit créé comme le notre par Lucas ou quelqu'un d'autre
      // (qui a le droit de créer des comptes SSH). Donc il faut générer une clé privée et la copier
      // directement dans ce script (ou un fichier à côté).
      privateKey: require("fs").readFileSync(process.env.SSHKEY),
      // Ma clé privée nécessite une passphrase, mais dans notre cas il n'y aura peut-être pas besoin.
      //passphrase: process.env.PP,
    });
    c.on("connect", function () {
      console.log("Connection :: connect");
    });
    c.on("ready", function () {
      ready = true;
      var conString = "postgres://" + process.env.PGUSER + ":" + process.env.PGPASS + "@127.0.0.1:" + proxyPort + "/zammad",
        client = new pg.Client(conString);
      client.connect(function (err) {
        if (err) {
          console.log("Error while connecting to the database");
          console.log(err);
          reject(err);
        } else {
          console.log("Connected to the database");
          resolve(client.query(query));
        }
      });
    });
  });
}

module.exports = clientCreated;
