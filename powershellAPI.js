var restify = require('restify');
var process = require('child_process');
//var fs = require('fs');



function cleanInput(input, level)
{
	//Clean input passed through via regular expression
	switch (level)
	{
		default:
			var output = input.replace(/([<])/g, '[');
			var output = output.replace(/([>])/g, ']');
			var output = output.replace(/(['])/g, '"');
		break;
		case 'strict':
			var output = input.replace(/[^A-Za-z0-9]/g, '');
		break;
		case 'email':
			var output = input.replace(/[^A-Za-z0-9@_\u002e-]/g, '');
		break;
	}

	return output;
}








function api(req, res, next)
{
	function sendCommand(command, computerList, callback)
	{
		//Input a command (string), and an array of computers.

		for (var amt = 0; amt < computerList.length; amt++)
		{
			runCommand(command, computerList[amt], computerList.length);
		}

		var computers = [];
		function runCommand(command, computerName)
		{
			console.log(command);
			process.exec('powershell.exe -Command invoke-command -computername ' + computerName + ' -ScriptBlock {' + command + '}"', addResultsToArray);


			function addResultsToArray(error, stdout, stderr)
			{
				computers.push({"name": computerName, "error": error, "stdout": stdout, "stderr": stderr });
				countResults();
			}
		}

		totalAmount = 0;
		function countResults()
		{
			console.log(totalAmount);
			totalAmount++;
			if (totalAmount == computerList.length)
			{
				callback(computers);
			}
		}
	}

	switch(req.url)
	{
		case '/powershell/sendcommand':
			console.log(req.body);
			sendCommand(req.body.command, req.body.computers, returnResults);
			function returnResults(results)
			{
				res.end(JSON.stringify(results));
			}

			break;
		case '/':
			console.log(req.body);
			break;
	}
}






var server = restify.createServer();
server.use(restify.bodyParser({ mapParams: false }));


server.post('/:a', api);
server.post('/:a/:a', api);

function ready()
{
	console.log('Ready for requests, on port 80.');
}

server.listen(80, ready);
