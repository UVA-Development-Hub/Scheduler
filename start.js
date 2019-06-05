var http = require('http');

app = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('Hello World!');
});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 8000;
}

app.listen(port);
