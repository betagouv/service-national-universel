var http = require('http')
var finalhandler = require('finalhandler')
var serveStatic = require('serve-static')

var serve = serveStatic('build', { index: ['index.html'] })

var server = http.createServer(function onRequest (req, res) {
  serve(req, res, finalhandler(req, res))
})

server.listen(process.env.PORT)