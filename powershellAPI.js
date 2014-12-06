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

function sendCommandToComputer(command, computerName, callback)
{
	//Runs the command and calls back the output. Takes a string, another string, and a callback.
	console.log("sendCommand:runCommand:" + computerName + ":" + command);
	process.exec('powershell.exe -Command invoke-command -computername ' + computerName + ' -ScriptBlock {' + command + '}"', addResultsToArray);


	function addResultsToArray(error, stdout, stderr)
	{
		callback({ "computer": computerName, "command": command, "error": error, "stdout": stdout, "stderr": stderr });
	}
}





function sendCommandToMultipleComputers(command, computerList, callback)
{
	//Input a command (string), and an array of computers. Takes a string, array of strings, and a callback.

	if (typeof command == "undefined" || typeof computerList == "undefined")
	{
		callback({ "error": "Bad input for function sendCommand!" });
	}

	var computers = [];

	for (var computerAmount = 0; computerAmount < computerList.length; computerAmount++)
	{
		sendCommandToComputer(command, computerList[computerAmount], computerList.length, countResults);
	}

	


	var totalAmount = 0;
	function countResults(resultFromComputer)
	{
		console.log(resultFromComputer);
		//Keeps track of total # of commands ran. Calls back when done.
		console.log("sendCommand:countResults:" + totalAmount + ":" + computerList.length);
		totalAmount++;
		if (totalAmount == computerList.length)
		{
			console.log("Callback!");
			callback(computers);
		}
	}
}




function sendMultipleCommandsToMultipleComputers(commands, computers, callback)
{
	//Runs the sendCommand function for each command. Takes two arrays of strings and a callback.
	var result = [];
	for (var amount = 0; commands.length  > amount; amount++)
	{
		sendCommandToMultipleComputers(commands[amount], computers, countRanCommands);
	}

	var amountDone = 0;
	function countRanCommands(resultsFromComputers)
	{
		amountDone++;
		console.log("sendMultipleCommands:countRanCommands:" + amountDone + ":" + commands.length);
		results.push(resultsFromComputers);
		if (amountDone == commands.length)
		{
			//Everything is done running!
			callback(computers);
		}
	}
}

function sendMultipleCommandsSequentialy()
{

}

function api(req, res, next)
{
	res.setHeader('Content-Type', 'application/json');

	switch(req.url)
	{
		case '/powershell/sendCommand':
			console.log(req.body);

			sendCommandToComputer("req.body.command", "req.body.computers", returnResults);
			function returnResults(results)
			{
				console.log(results);
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
