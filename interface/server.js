// set up ========================
var express  = require('express');
var app      = express(); 								// create our app w/ express
var ldap = require('ldapjs'); 					// mongoose for mongodb

// configuration =================
app.configure(function() {
	app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
	app.use(express.logger('dev')); 						// log every request to the console
	app.use(express.bodyParser()); 							// pull information from html in POST
});
// routes ===============

app.post('/api/address', function(req, res) {
	//take the posted mac addresses and insert them to AD with Ldapjs
	var addresses = req.body;

	for (var i = addresses.length - 1; i >= 0; i--) {
		if (addresses[i].valid && addresses[i].address.length == 12) {
 			var entry = {
			  cn: addresses[i].address,
			  //givenname: addresses[i].address,
			  //samaccountname: addresses[i].address,
			  //enable: 1,
			  AccountPassword: addresses[i].address,
			  objectclass: "user",
			  //userprincipalname: addresses[i].address
			};
			client.add('CN='+addresses[i].address+',OU=MAC Address Database,DC=Peninsula,DC=wednet,DC=edu', entry, function(err) {
			  if(err) {
			  	console.log(err);
			  	console.log(err.message);
			  	console.log(err.name);
			  	console.log(err.code);
			  	console.log(err.dn);
			  }
			});
		}
	};

	res.send({result: "success"});
});




app.get('*', function(req, res) {
	res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});



// listen (start app with node server.js) ======================================
app.listen(8080);
console.log("App listening on port 8080");