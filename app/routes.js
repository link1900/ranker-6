'use strict';

var greyhoundController = require('./controllers/greyhoundController');
var batchController = require('./controllers/batchController');
var userController = require('./controllers/userController');
var securityController = require('./controllers/securityController');
var helper = require('./helper');

module.exports = function(app) {
    //security routes
    app.post('/login', securityController.login);
    app.post('/logout', securityController.logout);

    //user routes
    app.post('/user', userController.create);
    app.get('/user/me', userController.me);

    app.get('/sealed',securityController.checkAuthentication, function(req, res){
        res.send(200, 'i am sealed');
    });

    //greyhound routes
    app.get('/greyhound', greyhoundController.getMany,  helper.runQuery);
    app.get('/greyhound/:greyhoundId', greyhoundController.getOne);
    app.get('/greyhound/:greyhoundId/offspring', greyhoundController.getOffspring, helper.runQuery);
    app.post('/greyhound',
        greyhoundController.createBody,
        greyhoundController.cleanFields,
        greyhoundController.checkFields,
        greyhoundController.checkForExists,
        greyhoundController.checkSireRef,
        greyhoundController.checkDamRef,
        greyhoundController.save);
    app.put('/greyhound/:greyhoundId',
        greyhoundController.mergeBody,
        greyhoundController.cleanFields,
        greyhoundController.checkFields,
        greyhoundController.checkForExists,
        greyhoundController.checkSireRef,
        greyhoundController.checkDamRef,
        greyhoundController.save);
    app.del('/greyhound/:greyhoundId', greyhoundController.destroy);
    app.param('greyhoundId', greyhoundController.setGreyhound);

    //batch routes
    app.get('/batch', batchController.prepareBatchQuery, helper.runQuery);
    app.get('/batch/:batchId', helper.getOne);
    app.put('/batch/:batchId', helper.mergeBody, batchController.checkFields, helper.save);
    app.del('/batch/:batchId', batchController.destroy);
    app.get('/batch/:batchId/record', batchController.getRecords, helper.runQuery);
    app.put('/batch/:batchId/run', batchController.processSpecificBatch);
    app.post('/upload/batch',batchController.createBatchFromFile);
    app.param('batchId', batchController.setBatch);

    //race routes



};
