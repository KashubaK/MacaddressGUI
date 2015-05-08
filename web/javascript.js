
var socket = io('http://addmac.apps1.psd401.net/');

socket.on('macAddressesResults', updateTable);
function updateTable(data) 
{
	console.log(data);
    var table = document.getElementById("macAddressesResults");

    var row = table.insertRow(table.rows.length);
    var name    = row.insertCell(0);
    var success = row.insertCell(1);
    var error   = row.insertCell(2);

    if (typeof data.macAddress === 'undefined' && typeof data.error === 'undefined')
    {
    	error.innerHTML = "Bad username || password.";
    }else
    {
	    name.innerHTML = data.macAddress;
	    success.innerHTML = data.success;
	    error.innerHTML = data.error;
    }


}


function addMacAddresses()
{
    var macAddresses = document.getElementById("macAddresses").value.split(/\r\n|\r|\n/g);
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    console.log(username + password);

    console.log(document.getElementById("action").value);

    if (document.getElementById("action").value == "Add macaddress")
    	socket.emit('addMacAddress', { 'username': username, 'password': password, 'addresses': macAddresses });

    if (document.getElementById("action").value == "Remove macaddress")
    	socket.emit('delMacAddress', { 'username': username, 'password': password, 'addresses': macAddresses });
}
