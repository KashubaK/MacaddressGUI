var sshServer     = require('ssh2').Server;

//For allowing powershell over ssh


module.exports = 
{
    server: server
}


function server(key)
{
	var info =
	{
		privateKey: key
	}
	new sshServer(info, connection).listen(23, '127.0.0.1', listeningStarted);

	function listeningStarted()
	{
		console.log('Listening on port ' + this.address().port);
	}

	function connection(client)
	{
		console.log('A client has connected!');
	}
}