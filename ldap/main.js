var ldap = require('ldapjs');

var client = ldap.createClient({ 'url': 'ldap://VMNOCDCDHCP__01' });




client.bind('serv_datascript@peninsula.wednet.edu', 'Eeth8xaS', stepA);




function stepA(error, result)
{
	if (error) { throw error; }
	client.search('DC=Peninsula,DC=wednet,DC=edu', { 'filter': '(badpwdcount>=5)', /*'scope': 'sub'*/ }, stepB);
	//console.log(result);
}

function stepB(error, result)
{
	if (error) { throw error };

	result.on('searchEntry', stepC);
/*	result.on('searchReference', stepC);
	result.on('error', stepC);
	result.on('end', stepC);
*/
}

function stepC(result)
{
	console.log(result);
	exit(0);
}