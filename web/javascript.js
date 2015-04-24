
var socket = io('http://127.0.0.1/');

socket.on('macAddressFinished', updateTable);
function updateTable(data) 
{
	console.log(data);
    var table = document.getElementById("macAddressesResults");

    var row = table.insertRow(table.rows.length);
    var name    = row.insertCell(0);
    var success = row.insertCell(1);
    var error   = row.insertCell(2);

    name.innerHTML = data.macAddress;
    success.innerHTML = data.success;
    error.innerHTML = data.error;
}


function addMacAddresses()
{
    var macAddresses = document.getElementById("macAddresses").value.split(/\r\n|\r|\n/g);
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    console.log(username + password);
    socket.emit('addMacAddress', { 'username': username, 'password': password, 'addresses': macAddresses });
}