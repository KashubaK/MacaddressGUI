var restify = require('restify');
var exec = require('child_process').exec;
//var fs = require('fs');
//removed edge, found simple solution


/* status: no error handling, need to clean up code*/



//change these as needed
var sessionTotal = 0;
var workingFolderPath = 'TEMP';


//powershell('DTTSD702207W764', 'shutdown -r -t 60; shutdown -a');

//removed powershellLocal, just use localhost as the host




console.log('powershellAPI init on ' + Date());

//Kill off the working folder (and everything in it) to remove leavings from the last session
//fs.rmdir(workingFolderPath);
//fs.mkdir(workingFolderPath);


function GET(req, res, next)
{
	res.writeHead(200, 
	{
		'Content-Type': 'text/html'
	});
	
	console.log('get: ' + req.url);
	switch (req.url) 
	{
		case '/addmac':
			res.end('NO');
		next();
		break;
		case '/':
			res.end('neat gui should go here');
		next();
		break;
		
	};
};


function POST(req, res, next)
{
	res.writeHead(200, 
	{
		'Content-Type': 'text'
	});
	
	
	//to quickly pop out JSON
	function makeJSON(amount, total, variable, value)
	{
		if (amount == 0)
			res.write('[\n');

		if (amount != total && amount != total -1)
		{
			res.write('\
			\t{\n\
			"' + variable + '": [\n\
			"' + value + '"\n\
			]\n\
			},\n\
			\
			');
		}
		
		if (amount == total - 1)
		{
			res.write('\
			\t{\n\
			"' + variable + '": [\n\
			"' + value + '"\n\
			]\n\
			}\n\
			\
			');
			res.end(']');

		}
	};
	
	
	//AD mod

	
	function powershell(name, commands)
	{
		exec('powershell.exe -Command invoke-command -computername "' + name + ' -ScriptBlock {' + commands + '}"', function(err, stdout, stderr) 
		{
			console.log(stderr);
			return(stderr.length);
		})
	};
	
	//init a powershell command and return it to the client (cuts the amount of code by four)
	function sendAndReturnPS(name, host, commands, amount, total, special)
	{
		exec('powershell.exe -Command invoke-command -computername ' + host + ' -ScriptBlock {' + commands + '}"', function(err, stdout, stderr) 
		{
			switch(special)
			{
				case 'robocopy':
					var result = stdout.substring(stdout.length - 36, stdout.length - 4);
					break;
				default:
					if(stderr)
					{
						var result = 'ERROR';
					}
					if(stdout)
					{
						var result = 'SUCCESS';
					}
					break;
			}
			
			
			res.write('[');
			if (amount != total && amount != total -1)
			{
				res.write('\
				\t{\n\
				"' + name + '": [\n\
				"' + result + '"\n\
				]\n\
				},\n\
				\
				');
			}
			
			if (amount == total - 1)
			{
				res.write('\
				\t{\n\
				"' + name + '": [\n\
				"' + result + '"\n\
				]\n\
				}\n\
				\
				');
				res.end(']');
			}
			console.log('Done with command ' + commands + ' on host ' + host + ' with name ' + name);
			console.log(stderr + stdout);
		})
	};
	
	
	//TODO: Add remote ssh support
	
	//end functions
	
	switch (req.url) 
	{
		case '/':
			makeJSON(0, 5, '/network/macaddress', 'Inputs mac addresses into the school network. Vars must start with macAddress[0], and continue upwords.');
			makeJSON(1, 5, '/remote/reboot', 'Reboots a selection of computers. Vars must start with computer[0] and continue upwords.');
			makeJSON(2, 5, '/remote/mkdir', 'Creates an folder. Use the var path to specify where to create the folder. Vars must start with computer[0] and continue upwords.');
			makeJSON(3, 5, '/remote/rmdir', 'Removes an folder. Use the var path to specify where to remove the folder. Vars must start with computer[0] and continue upwords.');
			makeJSON(4, 5, '/remote/robocopy', 'Copys an folder or file. Use the var path[0] to specify where to copy the folder or file from, and path[1] for the destination. Vars must start with computer[0] and continue upwords.');
			break;
			
		case '/remote/robocopy':
		//TODO: Rewrite this entire switch
			if (!req.body.computer[0])
			{
				res.end('computers must be defined as array');
				break;
			}
			
			if (!req.body.path[0])
			{
				res.end('path[0] folder to copy from');
				break;
			}
			
			if (!req.body.path[1])
			{
				res.end('path[1] folder to copy to');
				break;
			}
			
			
			//Checks to see how many items have been sent
			for (var amount = 0; amount > -1; amount++)
			{
				if (!req.body.computer[amount])
				{
					var totalComputers = amount;
					sessionTotal = sessionTotal + amount;
					break;
				}
			}
			
			for (var amount = 0; amount < totalComputers; amount++)
			{
				sendAndReturnPS(req.body.computer[amount], req.body.computer[amount], 'robocopy "' + req.body.path[0] + '" "' + req.body.path[1] + '" /E', amount, totalComputers, 'robocopy');
			}
			
			break;
		
		case '/remote/mkdir':
		
			if (!req.body.computer[0])
			{
				makeJSON(0, 1, 'ERROR', 'Computers must be defined as array starting at 0');
				break;
			}
			
			if (!req.body.path)
			{
				makeJSON(0, 1, 'ERROR', 'Var path must be defined!');
				break;
			}
			
			
			//Checks to see how many items have been sent
			for (var amount = 0; amount > -1; amount++)
			{
				if (!req.body.computer[amount])
				{
					var totalComputers = amount;
					sessionTotal = sessionTotal + amount;
					break;
				}
			}
			
			for (var amount = 0; amount < totalComputers; amount++)
			{
				sendAndReturnPS(req.body.computer[amount], req.body.computer[amount], 'mkdir "' + req.body.path + '"', amount, totalComputers);
			}
			
			break;
			
		case '/remote/rmdir':
		
			if (!req.body.computer[0])
			{
				makeJSON(0, 1, 'ERROR', 'Computers must be defined as array starting at 0');
				break;
			}
			
			if (!req.body.path)
			{
				makeJSON(0, 1, 'ERROR', 'Var path must be defined!');
				break;
			}
			
			
			//Checks to see how many items have been sent
			for (var amount = 0; amount > -1; amount++)
			{
				if (!req.body.computer[amount])
				{
					var totalComputers = amount;
					sessionTotal = sessionTotal + amount;
					break;
				}
			}
			
			for (var amount = 0; amount < totalComputers; amount++)
			{
				sendAndReturnPS(req.body.computer[amount], req.body.computer[amount], 'rmdir "' + req.body.path + '"', amount, totalComputers);
			}
			
			break;
		
		
		
		
		case '/remote/reboot':
		
			if (!req.body.computer[0])
			{
				makeJSON(0, 1, 'ERROR', 'Computers must be defined as array starting at 0');
				break;
			}
			
			
			//Checks to see how many items have been sent
			for (var amount = 0; amount > -1; amount++)
			{
				if (!req.body.computer[amount])
				{
					var totalComputers = amount;
					sessionTotal = sessionTotal + amount;
					break;
				}
			}
			
			for (var amount = 0; amount < totalComputers; amount++)
			{
				sendAndReturnPS(req.body.computer[amount], req.body.computer[amount], 'shutdown -r -t 0 "' + req.body.path + '"', amount, totalComputers);
			}
			
			break;
			
			
		case '/network/addmac':
		
			if (!req.body.macAddress[0])
			{
				res.end('macaddress must be defined as array');
				break;
			}
			
			//Checks to see how many items have been sent
			for (var amount = 0; amount > -1; amount++)
			{
				if (!req.body.macAddress[amount])
				{
					var totalMacAddresses = amount;
					sessionTotal = sessionTotal + amount;
					console.log(amount + ' mac addresses were just put into the system. (' + sessionTotal + ' total commands)');
					break;
				}
			}
			
			for (var amount = 0; amount < totalMacAddresses; amount++)
			{

			}
			break;
			
	};
	
	next();
};

var server = restify.createServer();
server.use(restify.bodyParser({ mapParams: false }));


server.get('/', GET);
server.post('/', POST);

server.get('/network/addmac', GET);
server.post('/network/addmac', POST);

server.get('/remote/reboot', GET);
server.post('/remote/reboot', POST);

server.get('/remote/rmdir', GET);
server.post('/remote/rmdir', POST);

server.get('/remote/mkdir', GET);
server.post('/remote/mkdir', POST);

server.get('/remote/robocopy', GET);
server.post('/remote/robocopy', POST);

server.listen(80, function() {
  console.log('Listening on ' + server.url);
});
