//Declare dependencies
var restify = require('restify');
var process = require('child_process');
var async = require('async');
var fs = require('fs'); 
var socket = require('socket.io');
//create server
var server = restify.createServer();
server.use(restify.bodyParser({ mapParams: false }));
var io = socket.listen(server.server);

io.on('connection', function(socket){
	console.log('connection established');
});

function log(data) {
	var stuff = data.toString();
	console.log(stuff);
	fs.appendFile('./logs/log.txt', stuff+'\n');
	io.emit('console req', stuff.toString());
}

//give the interface
server.get('/', function (req, res) {
	//set the headers, dude
	res.writeHead(200, {'Access-Control-Allow-Origin': '*','Content-Type': 'text/html'});
	//store content of html in variable
	var html = fs.readFileSync("./public/index.html");
	//send the spaghetti
	res.end(html);
});

//light interface
server.get('/w', function (req, res) {
	//set the headers, dude
	res.writeHead(200, {'Access-Control-Allow-Origin': '*','Content-Type': 'text/html'});
	//store content of html in variable
	var html = fs.readFileSync("./public/indexLight.html");
	//send the spaghetti
	res.end(html);
});

//required .js for interface
server.get('/core.js', function (req, res) {
	//headers headers headers
	res.writeHead(200, { 'Content-Type': 'text/javascript' });
	//store content in variable
	var corejs = fs.readFileSync('./public/core.js');
	//respond with said variable
	res.end(corejs);
});

server.get('/style.css', function (req, res) {
	//store content in variable
	var corejs = fs.readFileSync('./public/style.css');
	//respond with said variable
	res.end(corejs);
});

server.post('/auth', function (req, res) {
	res.writeHead(200, {'Content-Type': 'application/json'});
	var pass = req.body;
	log(' Authentication request received, password attempt: "' +pass[0].pass);
	if (pass[0].pass == "No more days like PHS 2013.") {
		log(' Authentication success! Allowing access.');
		res.end('true');
	} else {
		log(' Authentication failure. Denying access.');
		res.end('false');
	}
});

server.post('/adprop', function(req, res) {
	res.writeHead(200, {'Content-Type': 'application/json'});
	var uName = req.body;
	var password = '';
	var propReturn = {whenCreated: '', PasswordExpired: '', PasswordLastSet: '', Name: '', MemberOf: '', LastBadPasswordAttempt: '', LastLogonDate: '', Enabled: '', Created: '', EmailAddress: '', PSDssn: '', HasDefaultPassword: ''};

	function sortArray(str) {
		log(' Function sortArray called!');
		var arr = str.split(/\n/);
		propReturn.whenCreated = arr[1];
		log(' Account was created: ' +arr[1]);
		propReturn.PasswordExpired = arr[2];
		log(' Password expired? ' +arr[2]);
		propReturn.PasswordLastSet = arr[3];
		log(' Password was last set: ' +arr[3]);
		propReturn.Name = arr[4];
		log(" User's name: " +arr[4]);
		propReturn.LastBadPasswordAttempt = arr[5];
		log(' The password for this account was last entered incorrectly at: ' +arr[5]);
		propReturn.LastLogonDate = arr[6];
		log(' User last logged on at: ' +arr[6]);
		propReturn.Enabled = arr[7];
		log(' Account enabled? ' +arr[7]);
		propReturn.EmailAddress = arr[8];
		log(' Email address of user: ' +arr[8]);
		propReturn.PSDssn = arr[9];
		log(" Last four of user's SSN: " +arr[9]);
		password = propReturn.Name.substring(0, 4).toLowerCase() + propReturn.PSDssn;
		password = password.replace(' ', '');
		log(" User's password, if default, should be: " +password);
		log(' Function sortArray complete!');
	}

	function getProp(name) {
		if (name.userName) {
			process.exec('powershell.exe C:/Users/serv_datascript/Desktop/getADProps.ps1 ' +name.userName, function giveProperties (err, stdout, stderr) {
				sortArray(stdout);
				//check if it has default password, send response
				process.exec('powershell.exe C:/Users/serv_datascript/Desktop/memberOf.ps1 ' +name.userName, function setGroupProp (err, stdout, stderr) {
					var test = stdout;
					var newArr = [];
					test = test.replace(/\n/g, ',');
					//test = test.replace('\r', '');
					//test = test.replace('\n', '');
					test = test.replace(/(\r\n|\n|\r)/gm, '');
					test = test.replace(/[^a-zA-Z0-9- ,]/g, '');
					test = test.split(',');
					for (i = 0; i < test.length; i++) {
						if (test[i].indexOf('CN') !== -1) {
						    newArr.push(test[i]);
						}
					}
					propReturn.MemberOf = JSON.stringify(newArr);
					log('User belongs to groups: ' +propReturn.MemberOf);
					process.exec('powershell.exe C:/Users/serv_datascript/Desktop/check-ADCredential.ps1 ' +name.userName+ ' ' +password, function something (err, stdout, stderr) {
						if (stdout.indexOf("True") !== -1) {
							propReturn.HasDefaultPassword = "True";
							log('User has default password.');
							res.end(JSON.stringify(propReturn));
							log('Reponse sent.');
						} else {
							log('User does not have default password.');
							propReturn.HasDefaultPassword = "False";
							res.end(JSON.stringify(propReturn));
							log('Reponse sent.');
						}
					});
				});
				
			});
		} else {
			res.end('No username specified!');
		}
	}
	async.each(uName, getProp);
});

//When the interface posts to this, do the thing with the stuff
server.post('/network/addmac', function (req, res) {
	var addresses = req.body;
	var numOfAddresses = addresses.length; // - 1 for the for loop
	var response = [];
	var amount = 0;

	function addMac (address)
	{
		try {
			if (address.address.indexOf(/[^a-f0-9]/g) !== -1) {
				address.valid = false;
			} else if (address.address.length !== 12) {
				address.valid = false;
			} else {
				address.valid = true;
			}

			if (address.valid) {
				console.log('ps ' +fs.readFileSync('C:/Users/serv_datascript/Desktop/New-MacAddress.ps1'));
				process.exec('powershell.exe C:/Users/serv_datascript/Desktop/New-MacAddress.ps1 ' +address.address, function setResponse (err, stdout, stderr) {
					if (stdout.indexOf('Already') == -1) {
						address.added = true; //did get added
						address.note = 'Success!'; //set note as powershell output for client handling
						amount++; //done processing this one
						response.push(address);
						if (numOfAddresses == response.length) {
							log(response.toString());
							res.end(JSON.stringify(response));
						}
					} else {
						//if it was already
						address.added = false; //didn't get added
						address.note = "Address already existed."; //set status for client to handle
						amount++; //done processing mac address
						response.push(address);
						if (numOfAddresses == response.length) {
							log(response.toString());
							res.end(JSON.stringify(response));
						}	
						
					}
				});
			} else {
				address.added = false;
				address.valid = false;
				address.note = "Invalid address, not entered.";
				amount++; //done processing mac address
				response.push(address);
				if (numOfAddresses == response.length) {
					log(response.toString());
					res.end(JSON.stringify(response));
				}	
			}

		} catch (err) {
			log(err);
		}

		return response;
	}

	async.each(addresses, addMac);
});

//here goes nothing, start listening
server.listen(80, function() {
	var date = new Date();
	log('Server started: '+date);
	log('');
	log('');
	log('');
});