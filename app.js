//Declare node modules
var restify = require('restify');
var process = require('child_process');
var async = require('async');
var fs = require('fs'); 
var socket = require('socket.io');
var edge = require('edge');
//create server
var server = restify.createServer();
server.use(restify.bodyParser({ mapParams: false }));
var io = socket.listen(server.server);

io.on('connection', function(socket) {
	console.log('connection established' + new Date().getTime());
});

function log(data, bug) {
	var stuff = data.toString();
	console.log(stuff);
	if (!bug) {
		fs.appendFile('./logs/log.txt', stuff+'\n');
		io.emit('console req', stuff.toString());
	} else {
		fs.appendFile('./logs/bugs.txt', stuff+'\n');
	}
	
}

var enterPS = edge.func('ps', function () {/*
	  $ma = $inputFromJS
	  $spwd = ConvertTo-SecureString -AsPlainText $ma -Force
	  New-ADUser -Name $ma -Path "OU=Stu_Test,DC=Peninsula,DC=wednet,DC=edu" -AccountPassword $spwd -enable $true -DisplayName $ma -GivenName $ma -SamAccountName $ma -UserPrincipalName $ma
	  Set-ADUser -Identity $ma -PasswordNeverExpires $true
	  Add-ADGroupMember -Identity “CN=psd-secure,OU=Stu_Test,DC=Peninsula,DC=wednet,DC=edu” -member $ma
	  Write-Host "Mac address: $ma - Success! :)"
*/});

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
	log(' Authentication request received');
	if (pass[0].pass == "No more days like PHS 2013.") {
		log(' Authentication success! Allowing access.');
		res.end('true');
	} else {
		log(' Authentication failure. Denying access.');
		res.end('false');
	}
});

server.post('/adprop', function(req, res) {
	try {
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
								res.end(JSON.stringify(propReturn));
								log('Reponse sent.');
							} else {
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

	} catch (error) {
		res.end('An error has occurred. Remember, this app is in pre-avant-before-alpha-beta-gamma testing. Bugs are bound to happen. The bug has been logged, and will be worked on.');

		log(error, true);
	}
});

/*server.post('/network/delmac', function delMac (req, res) {
	var address = req.body;
	try {
		process.exec('powershell.exe C:/Users/serv_datascript/Desktop/Del-MacAddress.ps1 ' + address, function respond (err, stdout, stderr) {
			if (stdout.indexOf('Removed.') !== -1) {
				res.end('Address "' + address + '" has been removed successfully.');
			} else {
				res.end('Address "' + address + '" was not removed.');
			}
		});
	}
});*/

server.post('/network/deluser', function delUser (req, res) {
	var users = req.body; //Supposed to be an array of usernames
	
	var amount = users.length; //For loop stuff
	
	/*async.each(users, function(username) {
		process.exec('powershell.exe C:/Users/serv_datascript/Desktop/Del-User.ps1 ' + username, function respond (err, stdout, stderr) {

		})
	});*/
});


//When the interface posts to this, do the thing with the stuff
server.post('/network/addmac', function (req, res) {
	var addresses = req.body;
	var numOfAddresses = addresses.length;
	
	var amount = 0;

	var response = [];

	function addMac (address, cb)
	{
		console.log('addmac');

		try {
			if (address.address.indexOf(/[^a-f0-9]/g) !== -1) {
				address.valid = false;
			} else if (address.address.length !== 12) {
				address.valid = false;
			} else {
				address.valid = true;
			}

			if (address.valid) {
				//console.log('ps ' +fs.readFileSync('C:/Users/serv_datascript/Desktop/New-MacAddress.ps1'));
					process.exec('powershell.exe C:/Users/serv_datascript/Desktop/New-MacAddress.ps1 ' +address.address, function setResponse (err, stdout, stderr) {
					if (stdout.indexOf('Already') == -1) {
						address.added = true; //did get added
						address.note = 'Success!'; //set note as powershell output for client handling
						amount++; //done processing this one
						response.push(address);
						if (numOfAddresses == response.length) {
							log(JSON.stringify(response));
							res.end(JSON.stringify(response));
						}
					} else {
						//if it was already
						address.added = false; //didn't get added
						address.note = "Address already existed."; //set status for client to handle
						amount++; //done processing mac address
						response.push(address);
						if (numOfAddresses == response.length) {
							log(JSON.stringify(response));
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
					log(JSON.stringify(response));
					res.end(JSON.stringify(response));
				}
			}
		} catch (err) {
			log(err);
		}

		return response;
	}

	console.log('num addresses ' + numOfAddresses);

	/*for (i = 0; i < numOfAddresses; i++) {
		try {
			addMac(addresses[i], function (response) {
				console.log('callback');
				log(JSON.stringify(response));
				res.send(JSON.stringify(response));
			});
		} catch (err) {
			console.log(err);
		}
		
	};*/
});


//This URL is SPECIFICALLY used for Deploy Studio.
// DO NOT USE ELSEWHERE!!!!
server.post('/network/dsaddmac', function (req, res) {
	var ma = req.body;
	console.log('ma');
	console.log(ma[0]);
	var address = {
		address: ma[0],
		valid: null,
		note: null,
		added: null
	};

	address.address = address.address.replace(/:/g, '');

	if (address.address.length !== 12 && address.address.indexOf(/[^a-f0-9]/g) !== -1) {
		address.valid = false;
	} else {
		address.valid = true;
	}

	if (address.valid) {
		process.exec('powershell.exe C:/Users/serv_datascript/Desktop/New-MacAddress.ps1 ' + address.address, function setResponse (err, stdout, stderr) {
			if (stdout.indexOf('Already') == -1) {
				address.added = true; //did get added
				address.note = 'Address was successfully entered!'; //set note as powershell output for client handling
				res.end(JSON.stringify(address));
			} else {
				//if it was already
				address.added = false; //didn't get added
				address.note = "Address already existed."; //set status for client to handle
				res.end(JSON.stringify(address));
			}
		});
	} else {
		address.note = "Invalid mac address!";
		address.added = false;
		res.end(JSON.stringify(address));
	}

});

//here goes nothing, start listening
server.listen(80, function() {
	var date = new Date();
	log('Server started: '+date);
	log('');
});