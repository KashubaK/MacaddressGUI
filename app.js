var restify = require('restify');
var express = require('express');
var fs = require('fs');



function respond(req, res, next)
{

	switch (req.url) {
		case '/':
				res.writeHead(200, {
					'Content-Type': 'text/html'
				});
				var testHtml = fs.readFileSync('/test.html');
				res.write(testHtml);
				res.end(req.params.name);
				next(); 
	};		
};


function respond2(req, res, next)
{
	res.writeHead(200, {
		'Content-Type': 'text/html'
	});

	res.end(req.params.name);
	next(); 
};


var server = restify.createServer();
server.get('/', respond);
//server.get('/tools/:name', respond);
server.head('/tools/:name', respond2);

server.listen(80, function() {
  console.log('%s listening at %s', server.name, server.url);
});

