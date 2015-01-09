var restify = require('restify');
var fs = require('fs');
var os = require('os');




switch (os.type())
{
	case 'linux':
		var invoke = require('./linux/SSHCommand.js');
		break;
	case 'darwin':
	case 'Windows_NT':
		var invoke = require('./windows/PowerShellCommand.js');
		break;
	default:
		console.error('os not supported!');
		break;
}



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
			if (os.type() == 'Windows_NT')
			{

			}else
			{
				
			}
			sendCommand();
			break;
		

		case '/api/sendSSHCommand':
			sendCommand();
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