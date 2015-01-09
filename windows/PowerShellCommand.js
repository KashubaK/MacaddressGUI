var process = require('child_process');




module.exports = 
{
	command: sendCommandToWindowsComputer,
	commandsToList: sendManyCommandsToManyWindowsComputers,
	getOU: selectComputersFromOU
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
