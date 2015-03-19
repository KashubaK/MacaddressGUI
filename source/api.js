var run = require('./run.js');


module.exports = 
{
	api: api
}

run.timer.start('test');


function api(webserver)
{
	function index(req, res, next)
	{
		res.writeHead(250);
		res.end(JSON.stringify('api'));
	}

	webserver.post('/', index);
}