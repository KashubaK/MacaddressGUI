var process = require('child_process');





module.exports = 
{
	command: sendCommandToSSHComputer,
	commandsToList: sendManyCommandsToManySSHComputers,
//	getOU: selectComputersFromOU
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