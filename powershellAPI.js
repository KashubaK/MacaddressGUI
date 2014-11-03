var restify = require('restify');
var process = require('child_process');
var fs = require('fs'); //We need to, for reading our HTML files//var fs = require('fs'); We shouldn't be opening files directly?
//all counting of anything starts at zero

function gui (req, res, next)
{

	console.log("test");

	function grabInterface() {
		var html = fs.readFileSync("test2.html");
		res.end(html);
	};
	//function grabDirectories() {
//		process.exec('powershell.exe Invoke-command -scriptblock { Get-ChildItem //fs2/scripts/WebTool -force } ', psCallback);
//	};
	switch (req.url)
	{
		case '/':
			res.writeHead(200, { 'Content-Type': 'text/html' });
			grabInterface();
			break;
		case '/core.js':
			res.writeHead(200, { 'Content-Type': 'text/javascript' });
			var corejs = fs.readFileSync('./public/core.js');
			res.end(corejs);
			break;
		default:
			res.writeHead(200, { 'Content-Type': 'text/html' });
			grabInterface();
		break;

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
	res.writeHead(200, { 
		'Content-Type': 'application/json',
		'Access-Control-Allow-Origin': 'localhost:8080'
	});
	

	/*
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
				}

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
	*/
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
		case '/network/addmac':
			addMac();
		break;
	};

};

var server = restify.createServer();
server.use(restify.bodyParser({ mapParams: false }));

server.get('/', gui);
server.get('/core.js', gui);

server.post('/network/addmac', function (req, res) {
	res.writeHead(200, {'Access-Control-Allow-Origin': '*'});

	var macAddress = req.body;

	for (var amount = 0; amount < macAddress.length; amount++){
		if (macAddress[amount].
			valid) {
			function callback1(err, stdout, stderr) 
			{
				console.log(stdout);
				macAddress[amount].added = true;
				try {
					return(stderr.length);
				} catch(error)
				{
					console.error(error);
					return(error);
				}
				return(stderr.length);
			};
			process.exec('powershell.exe C:/Users/serv_datascript/Desktop/New-MacAddress.ps1 ' + macAddress[amount].address, callback1());
		} else {
			macAddress[amount].added = false;
		}
	};
	res.end(JSON.stringify(macAddress));
});

server.get('/network/getdirectories', function (req, res) {
	res.writeHead(200, { 'Content-Type': 'application/json'   });
		
	var directories = [];

	var generalDirectory = "//fs2/scripts/WebTool/";

	process.exec('powershell.exe Invoke-command -scriptblock { Get-ChildItem //fs2/scripts/WebTool -force } ', function (err, stdout, stderr) {
		if (!err || !stderr) {
			var scripts = stdout;
			//Begin to format, push names to array, push directories into array for future for loops
			scripts = scripts.split(/(\n)/gm);
			for (i = 0; i < scripts.length; i++) { 
				if (scripts[i]) {
					scripts[i] = scripts[i].replace(scripts[i].substring(0, 45), "");
					scripts[i] = scripts[i].replace("\r", "");
					if(scripts[i].indexOf(".ps1") != -1) {
						scripts[i] = scripts[i].substring(0, scripts[i].indexOf(".ps1") + 4);
						directories.push(generalDirectory + scripts[i]);
					}
				}
			}
			res.end(JSON.stringify(directories));
		} else {
			console.log(stderr + err);
			res.end(stderr + err);
		}
	});
});


//server.get('/:everything/:anything', gui);



function ready()
{
	console.log('Ready for requests, on port 80.');
};

server.listen(80, ready);



