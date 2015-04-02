var restify  = require('restify');
var cookies  = require('restify-cookies');
var fs       = require('fs');
var socketio = require('socket.io');
var config   = [];

var api      = require('./api.js');
var gui      = require('./gui.js');
var ssh      = require('./ssh.js');




//Load given https certificates into ram. The file extension for the key should be .key and the one for the certificate must be .crt.
fs.readFile(__dirname + '/../config/https.json', loadHttps);
function loadHttps(error, data)
{
    if (error) {  }
    config['https'] = JSON.parse(data);

    if (config['https'].key != '' && config['https'] != '')
    {
        fs.readFile(__dirname + '/../' + config['https'].key, loadKey);
    }else
    {
        startListening();
    }

    function loadKey(error, data)
    {
        if (error) { }
        config['https'].key = data;
        fs.readFile(__dirname + '/../' + config['https'].certificate, loadCert);
    }

    function loadCert(error, data)
    {
        if (error) { }
        config['https'].certificate = data;
        startListening();
    }
}


function startListening()
{
    //Create restify servers.
    var http  = restify.createServer();
    var https = restify.createServer({ 'key': config['https'].key, 'certificate': config['https'].certificate });

    //Make it so we can use req.body.
    http.use(restify.bodyParser());
    https.use(restify.bodyParser());

    //Make it so we can use cookies.
    http.use(cookies.parse);
    https.use(cookies.parse);

    https.use(restify.queryParser());

    //app interface
    //api.api(http);
    api.api(https);

    //graphical interface
    //gui.gui(http);
    //Https is the restify webserver, socketio.listen is socketio.
    gui.gui(https, socketio.listen(https));

    //Start http listening.
    //http.listen(80);
    https.listen(443);


    //Start ssh listening
    ssh.server(config['https'].key);

    console.log('powershellAPI 0.0.31 initialized at ' + new Date);
}