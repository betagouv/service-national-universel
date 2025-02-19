var http = require('http')
var serveStatic = require('serve-static')

var serve = serveStatic('build', { index: ['index.html'] })

var server = http.createServer(function onRequest (req, res) {
  serve(req, res)
})

server.listen(process.env.PORT)