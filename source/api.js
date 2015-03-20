var run = require('./run.js');


module.exports = 
{
	api: api
}


function api(webserver)
{
	function index(req, res, next)
	{
		res.writeHead(200);
		res.end(JSON.stringify('api'));
	}

	function sendWindowsCommand(req, res, next)
	{
		var computers = run.sanitize(req.body.computers, 'object');
		var commands  = run.sanitize(req.body.commands,  'object');

		run.windowsCommand(computers, commands, returnResult);
		function returnResult(data)
		{
			res.writeHead(200);
			res.end(JSON.stringify(data));
		}
	}

	webserver.post('/', index);
	webserver.post('/sendWindowsCommand', sendWindowsCommand);
}