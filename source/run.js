//Reusable code goes here.

module.exports = 
{
	'timer':
	{
		'start': startTimer,
		'poll':  pollTimer,
		'end':   endTimer
	},

	'log': log

	//'windowsCommand': function (commands, computers, callback)sendManyCommandsToManyWindowsComputers
}


/*===========================
==   Logging & debugging   ==
===========================*/

function log(severity, info)
{
	console.log(severity + ': ' + error);
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



/*===========================
== Windows command sending ==
===========================*/


function sendCommandToWindowsComputer(command, computerName, callback)
{
	//Runs the command using powershell's invoke-command function and calls back the output. Takes a string, another string, and a callback.
                                                                                                                                                                                                                                                                                                                                                  
	console.log("Sent command " + command + " to " + computerName);
	startTimer (computerName + ":" + command);


	var params = 
	[
 		"invoke-command -computername " + computerName + " -ScriptBlock {" + command + "}"
	]

	process.execFile('powershell.exe', params, addResultsToArray);


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