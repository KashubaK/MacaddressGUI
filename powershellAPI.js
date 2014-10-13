var restify = require('restify');
var process = require('child_process');
//var fs = require('fs'); We shouldn't be opening files directly?
//all counting of anything starts at zero

function gui (req, res, next)
{
	res.writeHead(200, { 'Content-Type': 'html/text'	});

	switch (req.url)
	{
		default:
			res.end('');
		break;
	};
};


function api (req, res, next)
{
	res.writeHead(200, { 'Content-Type': 'application/json'	});

	function windowsSendcmd ()
	{//Note: the computers will not return in the order that they were sent, but in the order of how quickly they ran.


		// == figure out how many computers we have been sent == //

		finalAmount = 0; //define before hand due to scoping

		console.log('it ran');
		for (var amount = 0; amount != -1; amount++)
		{
			//console.log(amount);
			if (typeof req.body.computer[amount]=="undefined")
			{
				//console.log("It's undefined!");
				finalAmount = (amount - 1);
				break;
			}
		}

		// == now run the requested command on each computer we've been sent (will be resource _heavy_) ==//

		function prepareForCommands()
		{
			res.write('[{');
			runCommands();
		};


		function runCommands ()
		{
			for (var amount = 0; amount != (finalAmount + 1); amount++)
			{
				//console.log(amount + '/' + finalAmount);

				/*if (amount == 0)
				{
					process.exec('powershell.exe -Command invoke-command -computername ' + req.body.computer[finalAmount] + ' -ScriptBlock {echo ' + req.body.computer[amount] + ';' + req.body.cmd + '}"', returnLastCommandResults);
				}*/

				//Run the last machine later on, not here inside this for loop
				if (amount != finalAmount)
				{
					process.exec('powershell.exe -Command invoke-command -computername ' + req.body.computer[amount] + ' -ScriptBlock {echo ' + req.body.computer[amount] + ';' + req.body.cmd + '}"', returnCommandResults);
				}
			}
		};

		var totalTimesRan = 0; //outside due to scope
		function countRanCommands ()
		{
			if (totalTimesRan == (finalAmount - 1))
			{
				//Running the last one here, everything else has already been ran
				process.exec('powershell.exe -Command invoke-command -computername ' + req.body.computer[finalAmount] + ' -ScriptBlock {echo ' + req.body.computer[amount] + ';' + req.body.cmd + '}"', returnLastCommandResults);
			}else
			{
				//This is not the last script to be ran...
				totalTimesRan++;
				//Not sure if this will work with a lot of commands ending at once...
			}
		};

		// == now tell about the commands we ran ==//

		function returnCommandResults (err, stdout, stderr)
		{
			console.log('not final');
			res.write('"stdout": "' + stdout.replace( /\r?\n|\r/g, r) + '",');
			res.write('"stderr": "' + stderr + '",');
			res.write('"err": "' + err + '"');
			countRanCommands(); // due to sync. running, the scripts will run utterly out of order, we need to count how many are done.
		};

		function returnLastCommandResults (err, stdout, stderr)
		{
			console.log('final');
			res.write('"stdout": "' + stdout + '",');
			res.write('"stderr": "' + stderr + '",');
			res.write('"err": "' + err + '"');
			endCommands(); //This is started after the one before the last has finished, therefore we know this will be the last one to start.
		};



		function endCommands ()
		{
			console.log('it ended');
			res.end('}]');
		};

		prepareForCommands();
	};

	console.log(req.url);

	switch (req.url)
	{
		default:
			res.end('');
		break;
		case '/windows/sendcmd':
			windowsSendcmd();
		break;
	};

};

var server = restify.createServer();
server.use(restify.bodyParser({ mapParams: false }));

server.get('/:everything/:anything', gui);
server.post('/:everything/:anything', api);

function ready()
{
	console.log('Ready for requests, on port 80.');
};

server.listen(80, ready);
