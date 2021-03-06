var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	path = require("path");

var port = process.env.PORT || 3000;
server.listen(port);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
});
app.get('/json/songInfo.json',function(req,res){
	res.sendfile('json/songInfo.json');
})
