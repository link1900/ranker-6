
var express = require('express');
var fs = require('fs');
var path = require('path');
var passport = require('passport');
var winston = require('winston');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {timestamp: true});

// Load configurations
// Set the node enviornment variable if not set before
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Initializing system variables 
var config = require('./config/config');
var mongoose = require('mongoose');
var grid = require('gridfs-stream');
grid.mongo = mongoose.mongo;

// Bootstrap db connection
var db = mongoose.connect(config.db);

// Bootstrap models
var models_path = __dirname + '/app/models';
var walk = function(path) {
    fs.readdirSync(path).forEach(function(file) {
        var newPath = path + '/' + file;
        var stat = fs.statSync(newPath);
        if (stat.isFile()) {
            if (/(.*)\.(js$|coffee$)/.test(file)) {
                require(newPath);
            }
        } else if (stat.isDirectory()) {
            walk(newPath);
        }
    });
};
walk(models_path);

//apply migrations
var migrationDir = path.join(__dirname, '/app/migrations');
var migrationService = require('./app/migration/migrationService');
migrationService.applyMigrations(migrationDir).then(function(){
    // Bootstrap passport config
    require('./config/passport')(passport);

    var app = express();

    // Express settings
    require('./config/express')(app, passport, db);

    // Rest routes
    require('./app/routes.js')(app);


    // Start the app by listening on <port>
    var port = process.env.PORT || config.port;
    var server = require('http').createServer(app);

    //var io = require('socket.io')(server);
    //require('./app/sockets.js').setup(io);

    server.listen(port);
    console.log('Express app started on port ' + port);

    //start scheduler
    var batchService = require('./app/batch/batchService');
    batchService.startBatchProcessors();
},function(error){
    console.log(error);
    console.error("critical failure apply migration exiting without server start");
    process.exit(1);
}).fail(function(err){
    console.log("failed to start server");
    console.log(err);
});


