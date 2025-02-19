const http = require('http')
const serveStatic = require('serve-static')
const send = require('send')

const path = "build";

const serve = serveStatic(path, { index: ['index.html'] });

const server = http.createServer(function onRequest (req, res) {
  serve(req, res, () => {
    send(req, path + '/index.html').pipe(res)
  });
});

const port = process.env.PORT || 8080
server.listen(port)