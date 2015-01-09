var restify = require('restify');
var process = require('child_process');
var fs = require('fs');


/*===========================
==     		Timers 		  ==
===========================*/

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











/*===========================
==   SSH command sending   ==
===========================*/

function sendCommandToSSHComputer(command, computerName, callback)
{
	//Runs the command using powershell's invoke-command function and calls back the output. Takes a string, another string, and a callback.

	console.log("Sent command " + command + " to " + computerName);


	startTimer(computerName + ":" + command);
	process.exec('ssh.exe -o StrictHostKeyChecking=no administrator@' + computerName + ' ' + command, addResultsToArray);


	function addResultsToArray(error, stdout, stderr)
	{
		console.log("Got command " + command + " back from " + computerName);

		callback({ "computer": computerName, "assumedLocation": computerName.substring(2,5), "delay": endTimer(computerName + ":" + command), "command": command, "error": error, "stdout": stdout, "stderr": stderr });
	}
}

function sendCommandToManySSHComputers(command, computers, callback)
{
	//Runs the sendCommandToSSHComputer function for each computer. Inputs a string for command, array for computers, and a callback.
	for (var amount = 0; amount < computers.length; amount++)
	{
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
		sendCommandToManySSHComputers(commands[amount], computers, collectResponses);
	}

	var responses = [];
	var responsesAmt = 0;
	function collectResponses(result)
	{
		responsesAmt++;
		for (var amount = 0; amount < result.length; amount++)
		{
			responses.push(result[amount]);
		}
		
		console.log(responsesAmt + ":" + commands.length);
		if (responsesAmt == commands.length)
		{
			callback(responses);
		}
	}
}







/*===========================
== Windows command sending ==
===========================*/

function sendCommandToWindowsComputer(command, computerName, callback)
{
	//Runs the command using powershell's invoke-command function and calls back the output. Takes a string, another string, and a callback.

	console.log("Sent command " + command + " to " + computerName);
	startTimer(computerName + ":" + command);

	process.exec('powershell.exe -Command invoke-command -computername ' + computerName + ' -ScriptBlock {' + command + '}"', addResultsToArray);


	function addResultsToArray(error, stdout, stderr)
	{
		console.log("Got command " + command + " back from " + computerName);

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
		for (var amount = 0; amount < result.length; amount++)
		{
			responses.push(result[amount]);
		}
		console.log(responsesAmt + ":" + commands.length);
		if (responsesAmt == commands.length)
		{
			callback(responses);
		}
	}
}

/*===========================
== Powershell info pulling ==
===========================*/

function selectComputersFromOU(group, filter, callback)
{
	//Returns all the computers by name in an array from an ou.
	console.log('select ou ' + group);

	if (typeof filter !== 'string')
	{
		filter = '*';
	}

	group = "'" + group + "'";

	console.log(typeof filter);

	var args = 
	[
		'powershell -command "Get-ADComputer -Filter ' + filter + ' -SearchBase ' + group + ' | select -expand name | ConvertTo-Json"'
	]
	process.execFile("powershell", args, stepA);


	function stepA(error, stdout, stderr)
	{
		if (error) { throw error; }
		if (stderr) { throw stderr; }

		callback(error, JSON.parse(stdout));
	}
}











/*===========================
==     	  Listening	       ==
===========================*/


//API
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
		case '/api/sendPowershellCommand':
			sendAPIPowershellCommand();
			break;

		case '/api/sendSSHCommand':
			sendAPISSHCommand();
			break;

		case '/api/':
			res.end(JSON.stringify(commands));
			break;
		default:
			res.end();
			break;
	}



	function sendAPIPowershellCommand()
	{
		switch (typeof req.body.computers)
		{
			case 'object':
				//An array of computers to plug straight in
				sendManyCommandsToManyWindowsComputers(req.body.commands, req.body.computers, returnResults);
				break;
			case 'string':

				selectComputersFromOU(req.body.computers, null, stepA);

				function stepA(error, result)
				{
					sendManyCommandsToManyWindowsComputers(req.body.commands, result, returnResults);
				}
				break;

			default:
				throw "Computers isn't an object or a string!";
				break;
		}


		function returnResults(results)
		{
			res.end(JSON.stringify(results));
		}
	}

	function sendAPISSHCommand()
	{
		switch (typeof req.body.computers)
		{
			case 'object':
				//An array of computers to plug straight in
				sendManyCommandsToManySSHComputers(req.body.commands, req.body.computers, returnResults);
				break;
			case 'string':

				selectComputersFromOU(req.body.computers, null, stepA);

				function stepA(error, result)
				{
					sendManyCommandsToManySSHComputers(req.body.commands, result, returnResults);
				}
				break;

			default:
				throw "Computers isn't an object or a string!";
				break;
		}


		function returnResults(results)
		{
			res.end(JSON.stringify(results));
		}
	}



}



//UI
function ui(req, res, next)
{
	switch(req.url)
	{
		case '/':
			fs.readFile(__dirname + '/content/simple.html', sendData);
			break;
		case '/simple':
			fs.readFile(__dirname + '/content/simple.html', sendData);
			break;
		case '/advanced':
			fs.readFile(__dirname + '/content/advanced.html', sendData);
			break;
		default:
			fs.readFile(__dirname + '/content/' + req.url, sendData);
			break;
	}


	function sendData(error, data)
	{
		if (error) { throw error; }
		res.end(data);
	}


	function returnMultResult(result)
	{
		console.log(result[0]);
	}

}






var server = restify.createServer();
server.use(restify.bodyParser({ mapParams: false }));











/*===========================
==     socketio (gui)	   ==
===========================*/

var io = require('socket.io').listen(server.server);

io.sockets.on('connection', liveConnection);

function liveConnection(socket)
{
	console.log('connected via socketio');


	socket.on('powershell', getResultsPowershell);

	function getResultsPowershell(inputType, selection, commands)
	{
		//Sending a powershell command to an ou via ui

		if (inputType == 'ou')
		{
			//Given a ou
			selectComputersFromOU(selection, null, stepA);
		}else
		{
			//Given an array of computers
			stepA(null, selection);
		}


		function stepA(error, result)
		{
			//Send each command to each computer
			if (error) { throw error; }

			for (var amountA = 0; amountA < commands.length; amountA++)
			{
				for (var amountB = 0; amountB < result.length; amountB++)
				{
					sendCommandToWindowsComputer(commands[amountA], result[amountB], emitResult);
					socket.emit('startedSending');
				}
			}

			//return the total amount of responces to expect
			socket.emit('totalSent', commands.length * result.length);
		}
	}


	socket.on('ssh', getResultsSSH);

	function getResultsSSH(inputType, selection, commands)
	{
		//Sending a powershell command to an ou via ui

		if (inputType == 'ou')
		{
			//Given a ou
			selectComputersFromOU(selection, null, stepA);
		}else
		{
			//Given an array of computers
			stepA(null, selection);
		}


		function stepA(error, result)
		{
			//Send each command to each computer
			if (error) { throw error; }

			for (var amountA = 0; amountA < commands.length; amountA++)
			{
				for (var amountB = 0; amountB < result.length; amountB++)
				{
					sendCommandToSSHComputer(commands[amountA], result[amountB], emitResult);
					socket.emit('startedSending');
				}
			}

			//return the total amount of responces to expect
			socket.emit('totalSent', commands.length * result.length);
		}
	}





	function emitResult(result)
	{
		//Send back a responce to be added to the table
		socket.emit('result', result);
	}
}





server.get('/', ui);
server.get('/:a', ui);
server.post('/api/:a', api);




function ready()
{
	console.log('Ready for requests, on port 80.');
}

server.listen(80, ready);