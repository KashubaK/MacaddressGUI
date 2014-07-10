var restify = require('restify');
var edge = require('edge');

var sessionTotal = 0;

console.log('powershellAPI init on ' + Date());





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
			res.end('neat gui');
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
	
	switch (req.url) 
	{
		case '/addmac':
			
			if (!req.body.macAddress[0])
			{
				res.end('macAddress: ' + req.params.amountOfAddresses);
				break;
			}
			
			//Checks to see how many mac addresses have been sent
			for (var amount = 0; amount < 2000; amount++)
			{
				if (!req.body.macAddress[amount])
				{
					var totalMacAddresses = amount;
					sessionTotal = sessionTotal + amount;
					console.log(sessionTotal + ' total, ' + amount + ' mac addresses inputed with status:');
					break;
				}
			}
			
			var macStatus = 0;
			
			for (var amount = 0; amount < totalMacAddresses; amount++)
			{
				//not sure on how to input data to powershell due to it having to be commented to run
				var addMac = edge.func('ps', function () {
				/*echo SUCCESS*/
				});
				
				addMac('Node.js', function (error, result) 
				{
					if (error) throw error;
					macStatus = result[0];
				});
			}
			
			
			for (var amount = 0; amount < totalMacAddresses; amount++)
			{
				/****** start JSON output reply *******/
				//Only difference between the two if statements below is that the last one does not add a comma after the ending bracket
				if (amount == 0)
					res.write('[\n');
				
				//If I am not the last item to be phrased
				if (amount != totalMacAddresses && amount != totalMacAddresses - 1)
				{
					res.write('\t{\n\
					"' + req.body.macAddress[amount] + '": [\n\
					"' + macStatus[amount] + '"\n\
					]\n\
					},\n\
					\
					');
				}
				
				//If I am the last item to be phrased
				if (amount == totalMacAddresses - 1)
				{
					res.write('\t{\n\
					"' + req.body.macAddress[amount] + '": [\n\
					"' + macStatus + '"\n\
					]\n\
					}\n\
					\
					');
				}
				
				if (amount == totalMacAddresses - 1)
					res.end(']');
				
				/******* end JSON output reply ********/
				}
				
				console.log(macStatus + ' ' + req.body.macAddress[amount]);
			
			
			//console.log(req);
			
			//console.log(req.body);
			//res.end();
			break;
			
	};
	
	next();
};

var server = restify.createServer();
server.use(restify.bodyParser({ mapParams: false }));

server.get('/addmac', GET);
server.post('/addmac', POST);



server.listen(80, function() {
  console.log('Listening on ' + server.url);
});
