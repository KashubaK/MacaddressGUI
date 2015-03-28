
var socket = io('https://10.0.0.146/');

socket.on('macAddressFinished', updateTable);
function updateTable(data) 
{
    var table = document.getElementById("macAddressesResults");

    table.innerHTML += JSON.stringify(data);


}


function addMacAddresses()
{
    macAddresses = document.getElementById("macAddresses").value.split(/\r\n|\r|\n/g);
    socket.emit('addMacAddress', macAddresses);
}
