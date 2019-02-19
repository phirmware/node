// Dependencies
var server = require('./lib/server');

// app wrapper
var app = {};

// Init function
app.init = function(){
    server.init();
};

// Initialize server
app.init();

// Export
module.exports = app;