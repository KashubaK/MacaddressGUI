var process = require('child_process');


module.exports = 
{
    timer:
    {
        start: startTimer,
        poll:  pollTimer,
        end:   endTimer
    },

    //logging / errors
    log: log,

    //Makes sure data is of the right input type.
    sanitize: sanitize,

    //Uses invoke-command to send a command to a remote windows device.
    windowsCommand: function (computers, commands, callback)
    {
        return sendCommandsToWindows(computers, commands, callback);
    },

    windowsScript: function (computers, commands, callback)
    {
        return sendScriptsToWindows(computers, commands, callback);
    },

    insertMacAddress: function (macAddresses, callback)
    {
        return insertMacAddress(macAddresses, callback);
    },

    removeMacAddress: function (macAddresses, callback)
    {
        return removeMacAddress(macAddresses, callback);
    }
}


/*===========================
==   Logging & debugging   ==
===========================*/

function log(severity, info)
{
    sanitize(severity, 'number');
    switch (severity)
    {
        case 2:
            console.log('INFO: ' + info);
            break;
        case 1:
            console.log('WARNING: ' + info);
            break;
        case 0:
            console.log('DANGER: ' + info);
            break;
    }
}


var times = [];
function startTimer(label)
{
    //Adds the time in unix time to the timer array.
    times[label] = (new Date).getTime();
}
function pollTimer(label)
{
    //Returns the amount of time since the timer was created (in ms).
    return (new Date).getTime() - times[label];
}
function endTimer(label)
{
    //Returns the amount of time since the timer was created (in ms). Also removes the label from the timer array so that it may be used again.
    var oldTime = times[label];
    delete times[label];
    return (new Date).getTime() - oldTime; 
}



/*===========================
==     Checking input     ==
===========================*/

function sanitize(input, type)
{
    if (typeof input !== type)
    {
        throw new Error('Got ' + typeof input + ', need ' + type + '. Are you missing an input?');
    }

    switch (typeof input)
    {
        case 'number':
            return input;
            break;
        case 'string':
            return clean(input);
            break;
        case 'object':
            for (var key in input)
            {
                input[key] = sanitize(input[key], typeof input[key]);
            }
            return input;
            break;
        default:
            throw new Error('Input must be a ' + type);
            return;
    }

    function clean(input)
    {
        return input/*.replace(/([^A-Za-z0-9._-])/g, '')*/;
    }
}

/*===========================
== Windows command sending ==
===========================*/

function psRunCommandOnComputer(computerName, command, callback)
{
    console.log(computerName);
    //Runs the command using powershell's invoke-command function and calls back the output. Takes a string, another string, and a callback.
    startTimer(computerName + ":" + command);
    console.log(command);
    var params = 
    [
        "invoke-command -computername " + computerName + " -ScriptBlock {" + command + "}"
    ]

    process.execFile('powershell.exe', params, addResultsToArray);
    function addResultsToArray(error, stdout, stderr)
    {
        if (computerName.length > 4)
        {
            console.log(computerName);
            var data = 
            {
                "computer":         computerName, 
                "assumedLocation":  computerName.substring(2,5), 
                "delay":            endTimer(computerName + ":" + command), 
                "command":          command, 
                "error":            error, 
                "stdout":           stdout, 
                "stderr":           stderr 
            }
        }else
        {
            console.log(computerName);
            var data = 
            {
                "computer":         computerName, 
                "assumedLocation":  null, 
                "delay":            endTimer(computerName + ":" + command), 
                "command":          command, 
                "error":            error, 
                "stdout":           stdout, 
                "stderr":           stderr 
            }
        }
        
        callback(data);
    }
}

//All AD related things must be ran local
function psRunCommandOnLocal(command, callback)
{
    startTimer('localhost' + ":" + command);

    var params = 
    [
        command
    ]

    process.execFile('powershell.exe', params, addResultsToArray);
    function addResultsToArray(error, stdout, stderr)
    {
        var data = 
        {
            "computer":         'localhost', 
            "assumedLocation":  'localhost', 
            "delay":            pollTimer('localhost' + ":" + command), 
            "command":          command, 
            "error":            error, 
            "stdout":           stdout, 
            "stderr":           stderr 
        }

        log(2, endTimer('localhost' + ":" + command) + 'ms | ' + command);
        callback(data);
    }
}

function psRunCommandsOnLocal(commands, callback)
{
    for (var i in commands)
    {
        psRunCommandOnLocal(commands[i], collectResponses);
    }

    var responses    = [];
    var responsesAmt = 0;
    function collectResponses(data)
    {
        responsesAmt++;
        responses.push(data);
        if (responsesAmt == commands.length)
        {
            callback(responses);
        }
    }
}

function psRunCommandsSequentiallyOnLocal(commands, callback)
{
    //Runs each command sequentially, for cases where you must not anger active directory.
    psRunCommandOnLocal(commands[0], collectResponses);

    var responses    = [];
    var responsesAmt = 0;
    function collectResponses(data)
    {
        responsesAmt++;
        responses.push(data);
        if (responsesAmt == commands.length)
        {
            callback(responses);
        }else
        {
            psRunCommandOnLocal(commands[responsesAmt], collectResponses);
        }
    }
}

function psRunScriptOnComputer(computerName, script, callback)
{
    //Runs the script using powershell's invoke-command function and calls back the output. Takes a string, another string, and a callback.
    startTimer(computerName + ":" + script);
    var params = 
    [
        "invoke-command -computername " + computerName + " -FilePath " + script + "../../scripts"
    ]

    process.execFile('powershell.exe', params, addResultsToArray);
    function addResultsToArray(error, stdout, stderr)
    {
        if (computerName.length > 4)
        {
            console.log(computerName);
            var data = 
            {
                "computer":         computerName, 
                "assumedLocation":  computerName.substring(2,5), 
                "delay":            endTimer(computerName + ":" + script), 
                "script":           script, 
                "error":            error, 
                "stdout":           stdout, 
                "stderr":           stderr 
            }
        }else
        {
            console.log(computerName);
            var data = 
            {
                "computer":         computerName, 
                "assumedLocation":  null, 
                "delay":            endTimer(computerName + ":" + script), 
                "script":           script, 
                "error":            error, 
                "stdout":           stdout, 
                "stderr":           stderr 
            }
        }
        
        callback(data);
    }
}

function sendCommandsToWindows(computers, commands, callback)
{
    //Send requested command to each computer.
    for (var alpha in computers)
    {
        for (var beta in commands)
        {
            //Ran as a seprate function to improve performance.
            if (computers[alpha] == 'localhost')
            {
                psRunCommandOnLocal(commands[beta], collectResponses);
            }else
            {
                psRunScriptOnComputer(computers[alpha], commands[beta], collectResponses);
            }
        }
    }

    //Collect all of the responses, and callback with data when done.
    var responses    = [];
    var responsesAmt = 0;
    function collectResponses(data)
    {
        responsesAmt++;
        responses.push(data);
        if (responsesAmt == computers.length * commands.length)
        {
            callback(responses);
        }
    }
}


function sendScriptsToWindows(computers, scripts, callback)
{
    //Send requested command to each computer.
    for (var alpha in computers)
    {
        for (var beta in scripts)
        {
            //Ran as a seprate function to improve performance.
            if (computers[alpha] == 'localhost')
            {
                psRunCommandOnLocal(scripts[beta], collectResponses);
            }else
            {
                psRunScriptOnComputer(computers[alpha], commands[beta], collectResponses);
            }
        }
    }

    //Collect all of the responses, and callback with data when done.
    var responses    = [];
    var responsesAmt = 0;
    function collectResponses(data)
    {
        responsesAmt++;
        responses.push(data);
        if (responsesAmt == computers.length * scripts.length)
        {
            callback(responses);
        }
    }
}

/*===========================
==  Adding a mac address  ==
===========================*/


function insertMacAddress(macAddresses, callback)
{
    //Has issues with the command not running sequentially.
    for (var i in macAddresses)
    {
        //Create & enable the AD user with a valid password, and add it to the psd-secure group.
        var commands = 
        [
            "New-ADUser -Name " + macAddresses[i] + " -Path 'OU=MAC Address Database,DC=Peninsula,DC=wednet,DC=edu' -AccountPassword (ConvertTo-SecureString -AsPlainText " + macAddresses[i] + " -Force) -enable $true -DisplayName " + macAddresses[i] + " -GivenName " + macAddresses[i] + " -SamAccountName " + macAddresses[i] + " -UserPrincipalName " + macAddresses[i],
            "Set-ADUser -Identity " + macAddresses[i] + " -PasswordNeverExpires $true",
            "Add-ADGroupMember -Identity “CN=psd-secure,OU=MAC Address Database,DC=Peninsula,DC=wednet,DC=edu” -member " + macAddresses[i]
        ]
        psRunCommandsSequentiallyOnLocal(commands, collectResponses);
    }

    var responses    = [];
    var responsesAmt = 0;
    function collectResponses(data)
    {
        responsesAmt++;
        responses.push(data);
        if (responsesAmt == macAddresses.length)
        {
            callback(responses);
        }
    }
}


function removeMacAddress(macAddresses, callback)
{
    for (var i in macAddresses)
    {
        psRunCommandOnLocal("Remove-ADUser -Identity " + macAddresses[i] + " -Path 'OU=MAC Address Database,DC=Peninsula,DC=wednet,DC=edu'", collectResponses);
    }

    var responses    = [];
    var responsesAmt = 0;
    function collectResponses(data)
    {
        responsesAmt++;
        responses.push(data);
        if (responsesAmt == macAddresses.length)
        {
            callback(responses);
        }
    }
}
