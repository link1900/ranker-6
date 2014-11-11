'use strict';

var greyhoundController = require('./greyhound/greyhoundController');
var batchController = require('./batch/batchController');
var batchResultController = require('./batch/batchResultController');
var userController = require('./controllers/userController');
var securityController = require('./controllers/securityController');
var raceController = require('./race/raceController');
var groupLevelController = require('./groupLevel/groupLevelController');
var placingController = require('./controllers/placingController');
var rankingSystemController = require('./controllers/rankingSystemController');
var pointAllotmentController = require('./controllers/pointAllotmentController');
var rankingController = require('./controllers/rankingController');
var adminController = require('./admin/adminController');
var helper = require('./helper');

module.exports = function(app) {
    //security routes
    app.post('/login', securityController.login);
    app.post('/logout', securityController.logout);

    //user routes
    app.post('/user', userController.create);
    app.get('/user/me', userController.me);

    //greyhound routes
    app.get('/greyhound', greyhoundController.prepareQuery,  helper.runQuery);
    app.get('/greyhound/:greyhoundId', helper.getOne);
    app.post('/greyhound', securityController.checkAuthentication,greyhoundController.create);
    app.put('/greyhound/:greyhoundId', securityController.checkAuthentication, greyhoundController.update);
    app.del('/greyhound/:greyhoundId',securityController.checkAuthentication, greyhoundController.destroy);
    app.param('greyhoundId', greyhoundController.setGreyhound);

    //batch routes
    app.get('/batch',securityController.checkAuthentication, batchController.prepareBatchQuery, helper.runQuery);
    app.get('/batch/:batchId',securityController.checkAuthentication, helper.getOne);
    app.get('/batch/:batchId/totals',securityController.checkAuthentication, batchController.totalForBatch);
    app.put('/batch/:batchId',securityController.checkAuthentication, helper.mergeBody, batchController.checkFields, helper.save);
    app.del('/batch/:batchId',securityController.checkAuthentication, batchController.destroy);
    app.post('/upload/batch/:importType/:importFileType',securityController.checkAuthentication, batchController.createBatchFromFile);
    app.param('batchId',securityController.checkAuthentication, batchController.setBatch);
    app.param('importType',securityController.checkAuthentication, batchController.setImportType);
    app.param('importFileType',securityController.checkAuthentication, batchController.setImportFileType);

    //batch record routes
    app.get('/batchResult', securityController.checkAuthentication, batchResultController.prepareQuery, helper.runQuery);
    app.get('/batchResult/:batchResultId',securityController.checkAuthentication, helper.getOne);
    app.param('batchResultId',securityController.checkAuthentication, batchController.setBatchResult);

    //race routes
    app.get('/race', raceController.prepareQuery, helper.runQuery);
    app.get('/race/:raceId', helper.getOne);
    app.post('/race', securityController.checkAuthentication, raceController.create);
    app.put('/race/:raceId', securityController.checkAuthentication, raceController.update);
    app.del('/race/:raceId',securityController.checkAuthentication, raceController.destroy);
    app.param('raceId', raceController.setRace);

    //distance routes
    app.get('/distance', raceController.prepareDistanceQuery, helper.runDistinctQuery);

    // group level routes
    app.get('/groupLevel', groupLevelController.prepareQuery, helper.runQuery);
    app.get('/groupLevel/:groupLevelId', helper.getOne);
    app.post('/groupLevel', securityController.checkAuthentication, groupLevelController.create);
    app.put('/groupLevel/:groupLevelId', securityController.checkAuthentication, groupLevelController.update);
    app.del('/groupLevel/:groupLevelId',securityController.checkAuthentication, groupLevelController.destroy);
    app.param('groupLevelId', groupLevelController.setModel);

    //placing routes
    app.get('/placing', placingController.prepareQuery, helper.runQuery);
    app.get('/placing/:placingId', helper.getOne);
    app.post('/placing', securityController.checkAuthentication, placingController.create);
    app.put('/placing/:placingId', securityController.checkAuthentication, placingController.update);
    app.del('/placing/:placingId',securityController.checkAuthentication, placingController.destroy);
    app.param('placingId', placingController.setModel);

    //ranking system
    app.get('/rankingSystem', rankingSystemController.prepareQuery, helper.runQuery);
    app.get('/rankingSystem/:rankingSystemId', helper.getOne);
    app.post('/rankingSystem', securityController.checkAuthentication, rankingSystemController.create);
    app.put('/rankingSystem/:rankingSystemId', securityController.checkAuthentication, rankingSystemController.update);
    app.del('/rankingSystem/:rankingSystemId',securityController.checkAuthentication, rankingSystemController.destroy);
    app.param('rankingSystemId', rankingSystemController.setModel);

    //point allotment
    app.get('/pointAllotment', pointAllotmentController.prepareQuery, helper.runQuery);
    app.get('/pointAllotment/:pointAllotmentId', helper.getOne);
    app.post('/pointAllotment', securityController.checkAuthentication, pointAllotmentController.createMany);
    app.param('pointAllotmentId', pointAllotmentController.setModel);

    //rankings
    app.get('/ranking', rankingController.prepareQuery, helper.runQuery);
    app.get('/ranking/:rankingId', helper.getOne);
    app.post('/ranking', securityController.checkAuthentication, rankingController.createRankings);
    app.param('rankingId', rankingController.setModel);

    //admin
    app.del('/admin/greyhound', securityController.checkAuthentication, adminController.removeAllGreyhounds);
    app.del('/admin/batch', securityController.checkAuthentication, adminController.removeAllBatchJobs);
};
