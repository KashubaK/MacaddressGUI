var run     = require('./run.js');
var restify = require('restify');
var fs      = require('fs');

//Require modules you want for each file at the top of every file.


//Code other files requiring this file can access.
module.exports = 
{
    gui:      gui
}


function gui(webserver, io)
{
    function example(req, res, next)
    {
        res.writeHead(200);
        res.end(__dirname);
    }
    


    webserver.get('/example', example);
    webserver.get(/./, restify.serveStatic({ default: 'index.html', directory: __dirname + '/web' }));

    io.sockets.on('connection', socketio);  //fwds socket.io to socketio function below
}



function socketio(socket)
{
    run.log(2, 'A client connected to socket.io!');

    function addMacAddress(data)
    {
        var macAddresses = run.sanitize(data, 'object');
        run.insertMacAddress(macAddresses, update, returnResult);    
    }

    function update(data)
    {
        socket.emit('macAddressFinished', data);
        //updates the table as mac addresses finish one by one
    }

    function returnResult(data)
    {
        //do nothing, will remove need for this.
    }



    socket.on('addMacAddress', addMacAddress);
}