/* global io */

var socket = io('/');
var commandsWaitingFor = 0;
var totalCommands      = 0;

socket.on('macAddressesResults', updateTable);
function updateTable(data) 
{
    commandsWaitingFor++;
    updateProgressBar(commandsWaitingFor, totalCommands);
    
    
	console.log(data);
    var table = document.getElementById("macAddressesResults");

    var row = table.insertRow(table.rows.length);
    if (data.success == false)
    {
        row.className = "danger";        
    }else
    {
        row.className = "active";
    }
    
    var name    = row.insertCell(0);
    var success = row.insertCell(1);
    var error   = row.insertCell(2);

    
    
    
    name.innerHTML    = data.macAddress;
    success.innerHTML = data.success;
    
    if (error != 'undefined')
        error.innerHTML   = data.error;

}


function updateProgressBar(amount, total)
{
    var percent = amount / total;
    var bar = document.getElementById("progress-bar");
    bar.style.width = percent * 100 + "%";
    bar.innerHTML   = percent * 100 + "%";
}


function addMacAddresses()
{
    var macAddresses = document.getElementById("macAddresses").value.split(/\r\n|\r|\n/g);
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    
    
    console.log(document.getElementById("action").value);

    for (var i in macAddresses)
    {
        totalCommands++;
        updateProgressBar(commandsWaitingFor, totalCommands);
        
        if (document.getElementById("action").value == "Add macaddress")
    	   socket.emit('addMacAddress', { 'username': username, 'password': password, 'addresses': macAddresses[i] });      

        if (document.getElementById("action").value == "Remove macaddress")
    	   socket.emit('delMacAddress', { 'username': username, 'password': password, 'addresses': macAddresses[i] }); 
    }

}
