var run = require('./run.js');


module.exports = 
{
    api: api
}


function api(webserver)
{
    function index(req, res, next)
    {
        res.writeHead(200);
        res.end(JSON.stringify('list of things the api can do here'));
    }

    function sendWindowsCommand(req, res, next)
    {
        var computers = run.sanitize(req.body.computers, 'object');
        var commands  = run.sanitize(req.body.commands,  'object');

        run.windowsCommand(computers, commands, returnResult);
        function returnResult(data)
        {
            res.writeHead(200);
            res.end(JSON.stringify(data));
        }
    }


    function sendWindowsScript(req, res, next)
    {
        var computers = run.sanitize(req.body.computers, 'object');
        var scripts   = run.sanitize(req.body.scripts,   'object');

        run.windowsScript(computers, scripts, returnResult);
        function returnResult(data)
        {
            res.writeHead(200);
            res.end(JSON.stringify(data));
        }
    }


    function addMacAddress(req, res, next)
    {
        var macAddresses = run.sanitize(req.body.macAddresses, 'object');

        run.insertMacAddress(macAddresses, update, returnResult);

        function update(data)
        {

        }

        function returnResult(data)
        {
            res.writeHead(200);
            res.end(JSON.stringify(data));
        }
    }

    webserver.post('/',                       index);
    webserver.post('/windows/command',        sendWindowsCommand);
    webserver.post('/windows/script',         sendWindowsScript);

    webserver.post('/network/addMac',          addMacAddress);
}