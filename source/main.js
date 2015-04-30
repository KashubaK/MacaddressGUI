var restify   = require('restify');
var cookies   = require('restify-cookies');
var socketio  = require('socket.io');
var request   = require('request');


var config =
{
    "Apis":
    {
        "powershell":  "https://10.0.0.146",
        "ssh":         ""
    },

    "listening":
    {
        "http":  process.ENV.PORT || 80,
        "https": false
    }
}
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
    if (config['listening'].http != false)
    {
        http.listen(config['listening'].http);
    }
/*
    if (config['listening'].https != false)
    {
        socketio.listen(https).
        https.listen(config['listening'].https);
    }*/

    console.log('Gui 0.0.1 initialized at ' + new Date);
}



function gui(webserver, io)
{
    webserver.get(/./, restify.serveStatic({ default: 'index.html', directory: __dirname + '/../web' }));
    io.sockets.on('connection', socket);
}

function socket(io)
{
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    console.log('Someone connected to socket.io!');

    io.on('addMacAddress', addMacAddress);
    function addMacAddress(data)
    {
        auth = 'Basic ' + new Buffer(data.username + ':' + data.password).toString('base64');
        var options =
        {
            'url':    'https://10.0.0.146/ad/macaddress',
            'method': 'PUT',
            'json':
            {
                'macAddresses': data.addresses
            },
            'headers':
            {
                'Authorization': auth
            }
        }
        request(options, getResult);
    }


    io.on('delMacAddress', delMacAddress);
    function delMacAddress(data)
    {
        auth = 'Basic ' + new Buffer(data.username + ':' + data.password).toString('base64');
        var options =
        {
            'url':    'https://10.0.0.146/ad/macaddress',
            'method': 'DELETE',
            'json':
            {
                'macAddresses': data.addresses
            },
            'headers':
            {
                'Authorization': auth
            }
        }
        request(options, getResult);
    }



    function getResult(error, res, body)
    {
        for (var i in body)
        {
            io.emit('macAddressesResults', body[i]);
        }
    }
}

