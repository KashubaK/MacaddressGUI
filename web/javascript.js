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

    var row = table.insertRow(1);
    if (data.success === false)
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

    if (data.success === true)
        success.innerHTML = "Yes";

    if (data.success === false)
        success.innerHTML = "No";
    
    if (error != 'undefined' || error !== null)
        for (var i in data.error)
            error.innerHTML += data.error[i] + '<br/>';

}

socket.on('badUserOrPass', showBadUserOrPass);
function showBadUserOrPass()
{
    document.getElementById('badUserOrPass').style.display = 'block';
    updateProgressBar(commandsWaitingFor, --totalCommands);

}

function hideBadUserOrPass()
{
    document.getElementById('badUserOrPass').style.display = 'none';
}

function updateProgressBar(amount, total)
{
    var percent = amount / total;
    var bar = document.getElementById("progress-bar");
    bar.style.width = percent * 100 + "%";
    bar.innerHTML   = amount + " / " + total + " requests";
}

function updateProgressBarErr(amount, total)
{
    var percent = amount / total;
    var bar = document.getElementById("progress-bar");
    bar.style.width = percent * 100 + "%";
    bar.innerHTML   = amount + " / " + total + " requests";
}

function addMacAddresses()
{
    var macAddresses = document.getElementById("macAddresses").value.split(/\r\n|\r|\n/g);
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    
    
    console.log(document.getElementById("action").value);

    for (var i in macAddresses)
    {
        if (macAddresses[i] === "")
            return;

        totalCommands++;
        updateProgressBar(commandsWaitingFor, totalCommands);
        
        if (document.getElementById("action").value == "Add macaddress" && macAddresses[i].length > 0)
    	   socket.emit('addMacAddress', { 'username': username, 'password': password, 'addresses': macAddresses[i] });      

        if (document.getElementById("action").value == "Remove macaddress" && macAddresses[i].length > 0)
    	   socket.emit('delMacAddress', { 'username': username, 'password': password, 'addresses': macAddresses[i] }); 
    }

}
