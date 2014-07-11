var restify = require('restify');
var exec = require('child_process').exec;
//var fs = require('fs');
//removed edge, found simple solution

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
	
	
	//functions for POST requests
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
			return(stderr.length);
		})
	};
	

	//end functions
	
	switch (req.url) 
	{
		case '/remote/reboot':
		
			if (!req.body.computer[0])
			{
				res.end('computers must be defined as array');
				break;
			}
			
			//Checks to see how many items have been sent
			for (var amount = 0; amount > -1; amount++)
			{
				if (!req.body.computer[amount])
				{
					var totalComputers = amount;
					sessionTotal = sessionTotal + amount;
					console.log(amount + ' computers were just rebooted. (' + sessionTotal + ' total commands)');
					break;
				}
			}
			
			for (var amount = 0; amount < totalComputers; amount++)
			{
				var computerStatus = 'unknown';
				
				//ps script here
				computerStatus = powershell(req.body.computer[amount], 'shutdown -r -t 0');
				
				makeJSON(amount, totalComputers, req.body.computer[amount], computerStatus);

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
				var macStatus = 'unknown';
				
				//ps script here
				macStatus = powershell(req.body.macAddress[amount], 'shutdown -r -t 0');
				
				makeJSON(amount, totalMacAddresses, req.body.macAddress[amount], 'D');

			}
			break;
			
	};
	
	next();
};

var server = restify.createServer();
server.use(restify.bodyParser({ mapParams: false }));


server.get('/network/addmac', GET);
server.post('/network/addmac', POST);

server.get('/remote/reboot', GET);
server.post('/remote/reboot', POST);


server.listen(80, function() {
  console.log('Listening on ' + server.url);
});
