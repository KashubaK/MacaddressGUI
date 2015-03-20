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
    }
}


/*===========================
==   Logging & debugging   ==
===========================*/

function log(severity, info)
{
    console.log(severity + ': ' + error);
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
== Windows command sending ==
===========================*/

function psRunOnComputer(computerName, command, callback)
{
    console.log(computerName);
    //Runs the command using powershell's invoke-command function and calls back the output. Takes a string, another string, and a callback.
    startTimer (computerName + ":" + command);
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

function sendCommandsToWindows(computers, commands, callback)
{
    //Send requested command to each computer.
    for (var alpha in computers)
    {
        for (var beta in commands)
        {
            psRunOnComputer(computers[alpha], commands[beta], collectResponses);
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
        return input.replace(/([^A-Za-z0-9._-])/g, '');
    }
}



