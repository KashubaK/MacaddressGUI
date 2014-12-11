var restify = require('restify');
var process = require('child_process');




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

var times = [];
function startTimer(label)
{
	//Adds the time in unix time to the timer array.
	times[label] = (new Date).getTime();
}
function pollTimer(label)
{
	//Returns the amount of time since the timer was created (in ms).
	return (new Date).getTime() - times[label];
}
function endTimer(label)
{
	//Returns the amount of time since the timer was created (in ms). Also removes the label from the timer array so that it may be used again.
	var oldTime = times[label];
	delete times[label];
	return (new Date).getTime() - oldTime; 
}






function sendCommandToSSHComputer(command, computerName, callback)
{
	//Runs the command using powershell's invoke-command function and calls back the output. Takes a string, another string, and a callback.
	console.log("sendCommand:runCommand:" + computerName + ":" + command);
	startTimer(computerName + ":" + command);
	process.exec('ssh.exe administrator@' + computerName + ' ' + command, addResultsToArray);


	function addResultsToArray(error, stdout, stderr)
	{

		callback({ "computer": computerName, "assumedLocation": computerName.substring(2,5), "delay": endTimer(computerName + ":" + command), "command": command, "error": error, "stdout": stdout, "stderr": stderr });
	}
}

function sendCommandToManySSHComputers(command, computers, callback)
{
	//Runs the sendCommandToSSHComputer function for each computer. Inputs a string for command, array for computers, and a callback.
	for (var amount = 0; amount < computers.length; amount++)
	{
		console.log(amount + ":" + computers[amount]);
		sendCommandToSSHComputer(command, computers[amount], collectResponses);
	}

	var responses = [];
	var responsesAmt = 0;
	function collectResponses(result)
	{
		responsesAmt++;
		responses.push(result);
		console.log(responsesAmt + ":" + computers.length);
		if (responsesAmt == computers.length)
		{
			callback(responses);
		}
	}
}



function sendManyCommandsToManySSHComputers(commands, computers, callback)
{
	//Runs the sendCommandToManySSHComputers function for each command. Inputs command as an array, computers as an array, and it takes a callback.
	for (var amount = 0; amount < commands.length; amount++)
	{
		console.log(amount + ":" + commands[amount]);
		sendCommandToManySSHComputers(commands[amount], computers, collectResponses);
	}

	var responses = [];
	var responsesAmt = 0;
	function collectResponses(result)
	{
		responsesAmt++;
		responses.push(result);
		console.log(responsesAmt + ":" + commands.length);
		if (responsesAmt == commands.length)
		{
			callback(responses);
		}
	}
}



function sendCommandToWindowsComputer(command, computerName, callback)
{
	//Runs the command using powershell's invoke-command function and calls back the output. Takes a string, another string, and a callback.
	console.log("sendCommand:runCommand:" + computerName + ":" + command);
	startTimer(computerName + ":" + command);
	process.exec('powershell.exe -Command invoke-command -computername ' + computerName + ' -ScriptBlock {' + command + '}"', addResultsToArray);


	function addResultsToArray(error, stdout, stderr)
	{

		callback({ "computer": computerName, "assumedLocation": computerName.substring(2,5), "delay": endTimer(computerName + ":" + command), "command": command, "error": error, "stdout": stdout, "stderr": stderr });
	}
}

function sendCommandToManyWindowsComputers(command, computers, callback)
{
	//Runs the sendCommandToWindowsComputer function for each computer. Inputs a string for command, array for computers, and a callback.
	for (var amount = 0; amount < computers.length; amount++)
	{
		console.log(amount + ":" + computers[amount]);
		sendCommandToWindowsComputer(command, computers[amount], collectResponses);
	}

	var responses = [];
	var responsesAmt = 0;
	function collectResponses(result)
	{
		responsesAmt++;
		responses.push(result);
		console.log(responsesAmt + ":" + computers.length);
		if (responsesAmt == computers.length)
		{
			callback(responses);
		}
	}
}



function sendManyCommandsToManyWindowsComputers(commands, computers, callback)
{
	//Runs the sendCommandToManyWindowsComputers function for each command. Inputs command as an array, computers as an array, and it takes a callback.
	for (var amount = 0; amount < commands.length; amount++)
	{
		console.log(amount + ":" + commands[amount]);
		sendCommandToManyWindowsComputers(commands[amount], computers, collectResponses);
	}

	var responses = [];
	var responsesAmt = 0;
	function collectResponses(result)
	{
		responsesAmt++;
		responses.push(result);
		console.log(responsesAmt + ":" + commands.length);
		if (responsesAmt == commands.length)
		{
			callback(responses);
		}
	}
}

function api(req, res, next)
{
	res.setHeader('Content-Type', 'application/json');

	var commands = { 
		"sendPowershellCommand": "Sends powershell commnads to a list of computers. Requires there to be a commands array (of commands to be ran), and a computers array.",
		"sendSSHCommand": "Sends SSH commands to a list of coputers. Requires there to be a comands array (of commands to be ran), and a computers array."/*,
		"addMacAddress": "Requires there to be an array of macadresses to be added to the mac address database."*/
		 };



	switch(req.url)
	{
		case '/sendPowershellCommand':
			console.log(req.body);

			sendManyCommandsToManyWindowsComputers(req.body.commands, req.body.computers, returnResults);
			function returnResults(results)
			{
				res.end(JSON.stringify(results));
			}

			break;

		case '/sendSSHCommand':
			console.log(req.body);

			sendManyCommandsToManySSHComputers(req.body.commands, req.body.computers, returnResults);
			function returnResults(results)
			{
				res.end(JSON.stringify(results));
			}

			break;
		case '/':
			res.end(JSON.stringify(commands));
			break;
	}
}






var server = restify.createServer();
server.use(restify.bodyParser({ mapParams: false }));


server.post('/:a', api);
server.post('/powershell/:a', api);



function ready()
{
	console.log('Ready for requests, on port 80.');
}

server.listen(80, ready);
