$('.dropdown-toggle').dropdown();

//Hide alert messages
document.getElementById('sendToWholeDistrict').style.display='none';


/*===========================
==     	  buttons	       ==
===========================*/
var mode = "powershell";


function setPowershell()
{
	//sends a powershell command
	mode = "powershell";
	document.getElementById('powershell').className = 'btn btn-primary active';
	document.getElementById('ssh').className = 'btn btn-primary';
}



function setSSH()
{
	//sends a ssh command
	mode = "ssh";
	document.getElementById('powershell').className = 'btn btn-primary';
	document.getElementById('ssh').className = 'btn btn-primary active';
}


var inputType = "ou";

document.getElementById('computers').style.display='none';
function setOU()
{
	inputType = "ou";
	document.getElementById('listOfComputers').className = 'btn btn-primary';
	document.getElementById('ouButton').className = 'btn btn-primary active';

	document.getElementById('ou').style.display='block';
	document.getElementById('computers').style.display='none';
}

function setListOfComputers()
{
	inputType = "listOfComputers";
	document.getElementById('ouButton').className = 'btn btn-primary';
	document.getElementById('listOfComputers').className = 'btn btn-primary active';

	document.getElementById('ou').style.display='none';
	document.getElementById('computers').style.display='block';
}



//Connecting to socketio
var socket = io.connect('http://10.5.1.108/');

socket.on('connect', stepA);

function stepA()
{
	socket.emit('test', 'q');
}

/*===========================
==      progress bar       ==
===========================*/

var currentAmount = 0;
var totalAmount = 0;

function increaseBar()
{
	currentAmount++;
	document.getElementById('bar').style.width = (currentAmount / totalAmount) * 100 + '%';
	document.getElementById('bar').innerHTML = currentAmount + "/" + totalAmount;
	if (currentAmount != totalAmount)
	{
		document.getElementById('barholder').style.display='block';
	}else
	{
		document.getElementById('barholder').style.display='none';
	}
}

function updateBar()
{
	document.getElementById('bar').style.width = (currentAmount / totalAmount) * 100 + '%';
	document.getElementById('bar').innerHTML = currentAmount + "/" + totalAmount;
	if (currentAmount != totalAmount)
	{
		document.getElementById('barholder').style.display='block';
	}else
	{
		document.getElementById('barholder').style.display='none';
	}
}


/*===========================
==     	  sending	       ==
===========================*/

function send()
{
	document.getElementById('send').innerHTML = 'Grabing list of computers...';
	document.getElementById('send').className += ' disabled';

	var commands = document.getElementById('commands').value.split('\n');

	if (inputType == 'ou')
	{
		//If ou
		if (document.getElementById('ou').value.length < 40)
		{
			document.getElementById('sendToWholeDistrict').style.display='block';
			document.getElementById('send').innerHTML = 'Send';
			document.getElementById('send').className = 'btn btn-primary btn-block';
		}else
		{
			socket.emit(mode, inputType, document.getElementById('ou').value, commands);
		}
	}else
	{
		//if list of computers
		var computers = document.getElementById('computers').value.split('\n');
		computers = computers.split(',');
		socket.emit(mode, inputType, computers, commands);
	}
}

socket.on('startedSending', updateButton);

function updateButton()
{
	//Commands are now sending
	document.getElementById('send').innerHTML = 'Sending commands...';
	document.getElementById('results').style.display='block';
}



socket.on('totalSent', commandsSent);

function commandsSent(amountSent)
{
	//amountSent is the total amount of commands sent.
	totalAmount = amountSent + totalAmount;
	updateBar();
	document.getElementById('send').innerHTML = amountSent + ' commands sent!';
	setInterval(setBack, 4000);
}


function setBack()
{
	document.getElementById('send').innerHTML = 'Send';
	document.getElementById('send').className = 'btn btn-primary btn-block';

	//document.getElementById('send').style.display='block';
}



function sendOverride()
{
	socket.emit(mode, inputType, document.getElementById('ou').value, commands);
	document.getElementById('send').innerHTML = 'Send';
}


/*===========================
==     	show results       ==
===========================*/

socket.on('result', appendToTable);

function appendToTable(data)
{
	increaseBar();

	var table = document.getElementById('table');
	var row = table.insertRow(table.rows.length);

	var assumedLocation = row.insertCell(0);
	assumedLocation.innerHTML = data.assumedLocation;

	var computer = row.insertCell(1);
	computer.innerHTML = data.computer;

	var delay = row.insertCell(2);
	delay.innerHTML = data.delay;

	var command = row.insertCell(3);
	command.innerHTML = data.command;

	var stdout = row.insertCell(4);
	stdout.innerHTML = data.stdout.replace(/(\n)/g, '<br/>').replace(/(\s)/g, '&nbsp;');

	var stderr = row.insertCell(5);
	stderr.innerHTML = data.stderr.replace(/(\n)/g, '<br/>').replace(/(\s)/g, '&nbsp;');
}

