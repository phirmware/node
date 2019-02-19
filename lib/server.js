// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var stringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
var handlers = require('./handlers');
var helpers = require('./helpers');
var path = require('path');


var server = {};

// Create the http server instance
server.httpServer = http.createServer((req, res) => {
    server.unifiedServer(req, res);
});

server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};


// Create the https server instance
server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
    server.unifiedServer(req, res);
});


// server logic for both http and https
server.unifiedServer = function (req, res) {
    //parse the url
    var parsedUrl = url.parse(req.url, true);

    //get url path
    var path = parsedUrl.pathname;

    // Trim Url path
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    var queryStringObject = parsedUrl.query;

    // Get the http method and change to lower case
    var method = req.method.toLowerCase();

    // Get the headers as an object
    var headers = req.headers;

    // If Payload , get payload
    var decoder = new stringDecoder('utf-8');
    var buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });
    req.on('end', () => {
        buffer += decoder.end();


        // Choose the handler the request should go to if it exists else notFOund takes over
        var chosenHandler = typeof (server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        // Route to public if route is public/*
        //trimmedPath = trimmedPath.indexOf('public') > -1 ? 'public' : trimmedPath;
        if (trimmedPath.indexOf('public') > -1) {
            chosenHandler = handlers.public;
        }

        // Construct data object to send to handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)
        }

        chosenHandler(data, function (statusCode, payload, contentType) {
            contentType = typeof (contentType) == 'string' ? contentType : 'json';

            // If statusCode is a number continue else assign 200
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

            var payloadString = '';
            if (contentType == 'json') {

                // Get the payload, should be an object else {}
                payload = typeof (payload) == 'object' ? payload : {};

                // Payload sent to the user must be a string
                var payloadString = JSON.stringify(payload);

                res.setHeader('Content-Type', 'application/json');
            }

            if (contentType == 'html') {
                res.setHeader('Content-Type', 'text/html');

                // Get the payload, should be a string else ''
                payloadString = typeof (payload) == 'string' ? payload : '';
            }

            if (contentType == 'css') {
                res.setHeader('Content-Type', 'text/css');
                payloadString = typeof (payload) !== 'undefined' ? payload : '';

            }

            if (contentType == 'js') {
                res.setHeader('Content-Type', 'text/javascript');
                payloadString = typeof (payload) !== 'undefined' ? payload : '';
            }



            // Return response
            res.writeHead(statusCode);
            res.end(payloadString);
            // console.log('Returning this response ', statusCode, payloadString);
        });
    });
}



server.router = {
    '': handlers.index,
    'ping': handlers.ping,
    'api/users': handlers.users,
    'api/token': handlers.token,
    'public': handlers.public
}


server.init = function () {
    server.httpServer.listen(config.httpPort, () => {
        console.log('\x1b[33m%s\x1b[0m', `Listening on Port ${config.httpPort} in ${config.envName}`);
    });

    server.httpsServer.listen(config.httpsPort, () => {
        console.log('\x1b[34m%s\x1b[0m', `Listening on Port ${config.httpsPort} in ${config.envName}`);
    });
}

module.exports = server;