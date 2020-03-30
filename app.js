var path = require('path');
var express = require('express');

var app = express();

var staticPath = path.join(__dirname, '/static');
app.use(express.static('static'))
app.get('/', function (req, res) {
    res.sendFile(staticPath +'/index.html')
})

app.listen(3000, function() {
  console.log('listening');
});