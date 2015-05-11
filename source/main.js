/// <reference path="../typings/node/node.d.ts"/>
var restify   = require('restify');
var cookies   = require('restify-cookies');
var socketio  = require('socket.io');
var request   = require('request');


var config =
{
    "apis":
    {
        "powershell":  "10.0.0.146",
        "ssh":         ""
    },

    "listening":
    {
        "http":  /*process.env ? process.env.PORT :*/ 80
    }
};


startListening();
function startListening()
{
    //Create restify servers.
    var http  = restify.createServer();
    //var https = restify.createServer({ 'key': config['ssl'].key, 'certificate': config['ssl'].certificate });

    //Make it so we can use req.body.
    http.use(restify.bodyParser());
    //https.use(restify.bodyParser());

    //Make it so we can use cookies.
    http.use(cookies.parse);
    //https.use(cookies.parse);

    http.use(restify.queryParser());
    //https.use(restify.queryParser());

    //app interface
    gui(http,  socketio.listen(http));
    //gui(https, socketio.listen(https));

    //Start http listening.
    http.listen(config['listening'].http);

    console.log('Gui 0.0.1 initialized at ' + new Date + ' on port ' + config['listening'].http);
}



function gui(webserver, io)
{
    webserver.get(/./, restify.serveStatic({ default: 'index.html', directory: __dirname + '/../web' }));
    io.sockets.on('connection', socket);
}

var openConnections = 0;
function socket(io)
{
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    
    console.log(++openConnections + ' clients now connected to socketio.');

    io.on('disconnect', disconnect);
    function disconnect()
    {
        console.log(--openConnections + ' clients now connected to socketio.');
    }


    io.on('addMacAddress', addMacAddress);
    function addMacAddress(data)
    {
        //console.log(data);
        var auth = 'Basic ' + new Buffer(data.username + ':' + data.password).toString('base64');
        var options =
        {
            'url':    'https://' + config['apis'].powershell + '/ad/macaddress',
            'method': 'PUT',
            'json':
            {
                'macAddresses': [ data.addresses ]
            },
            'headers':
            {
                'Authorization': auth
            }
        };
        request(options, getResult);
    }


    io.on('delMacAddress', delMacAddress);
    function delMacAddress(data)
    {
        var auth = 'Basic ' + new Buffer(data.username + ':' + data.password).toString('base64');
        var options =
        {
            'url':    'https://' + config['apis'].powershell + '/ad/macaddress',
            'method': 'DELETE',
            'json':
            {
                'macAddresses': [ data.addresses ]
            },
            'headers':
            {
                'Authorization': auth
            }
        };
        request(options, getResult);
    }



    function getResult(error, res, body)
    {
        if (error) { console.log(error); }
        console.log(body);
        for (var i in body)
        {
            io.emit('macAddressesResults', body[i]);
        }
    }
}

