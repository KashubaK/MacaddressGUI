var run = require('./run.js');

//Require modules you want for each file at the top of every file.


//Code other files requiring this file can access.
module.exports = 
{
	gui: gui
}


function gui(webserver)
{
	function index(req, res, next)
	{
		res.writeHead(200);
		res.end('gui');
	}

	webserver.get('/', index);
}