var placingController = module.exports = {};

var _ = require('lodash');
var q = require('q');
var Placing = require('./placing').model;
var Race = require('../race/race').model;
var Greyhound = require('../greyhound/greyhound').model;
var helper = require('../helper');
var mongoService = require('../mongoService');

placingController.setModel = function(req, res, next, id) {
    Placing.findById(id, function(err, model) {
        if (err) return next(err);
        if (!model) return next(new Error('Failed to load ' + id));
        req.model = model;
        return next();
    });
};

placingController.prepareQuery = function(req, res, next) {
    req.searchQuery = {};
    var raceRef = req.param('raceRef');
    var greyhoundRef = req.param('greyhoundRef');

    if (raceRef){
        req.searchQuery.raceRef = raceRef;
    }
    if (greyhoundRef){
        req.searchQuery.greyhoundRef = greyhoundRef;
    }
    req.dao = Placing;
    next();
};

placingController.create = function(req, res) {
    var entityRequest = {};
    entityRequest.rawEntity = req.body;
    var processChain = placingController.preProcessRaw(entityRequest)
        .then(placingController.make)
        .then(placingController.validate)
        .then(placingController.updateRaceFlyweight)
        .then(placingController.updateGreyhoundFlyweight)
        .then(helper.saveEntityRequest);

    helper.promiseToResponse(processChain, res);
};

placingController.update = function(req, res) {
    var entityRequest = {};
    entityRequest.rawEntity = req.body;
    entityRequest.existingEntity = req.model;
    var processChain = placingController.preProcessRaw(entityRequest)
        .then(helper.mergeEntityRequest)
        .then(placingController.validate)
        .then(placingController.updateRaceFlyweight)
        .then(placingController.updateGreyhoundFlyweight)
        .then(helper.saveEntityRequest);

    helper.promiseToResponse(processChain, res);
};

placingController.destroy = function(req, res) {
    helper.responseFromPromise(res, mongoService.removePromise(req.model));
};

placingController.make = function(entityRequest) {
    entityRequest.newEntity = new Placing(entityRequest.newEntity);
    return q(entityRequest);
};

placingController.validate = function(entityRequest){
    var model = entityRequest.newEntity;
    if (!model.placing){
        return q.reject("placing field is required");
    }
    var validPlacings = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","DNF","disqualified"];
    if (!_.contains(validPlacings,model.placing)){
        return q.reject("placing must be between 1 and 30");
    }

    if (!model.raceRef){
        return q.reject("raceRef field is required");
    }

    if (!model.greyhoundRef){
        return q.reject("greyhoundRef field is required");
    }

    return placingController.checkRaceRefExists(entityRequest)
        .then(placingController.checkGreyhoundRefExists)
        .then(placingController.checkGreyhoundRefNotAlreadyUsed);
};

placingController.updateRaceFlyweight = function(entityRequest){
    var deferred = q.defer();

    Race.findById(entityRequest.newEntity.raceRef, function(err, model) {
        if (err) return deferred.reject("cannot check race ref");
        if (!model) return deferred.reject("cannot find race ref");
        entityRequest.newEntity.race = model;
        deferred.resolve(entityRequest);
    });

    return deferred.promise;
};

placingController.updateGreyhoundFlyweight = function(entityRequest){
    var deferred = q.defer();
    Greyhound.findById(entityRequest.newEntity.greyhoundRef, function(err, model) {
        if (err) return deferred.reject("cannot check greyhound ref");
        if (!model) return deferred.reject("cannot find greyhound ref");
        entityRequest.newEntity.greyhound = model;
        deferred.resolve(entityRequest);
    });
    return deferred.promise;
};

placingController.preProcessRaw = function(entityRequest){
    entityRequest.newEntity =  entityRequest.rawEntity;
    return q(entityRequest);
};

placingController.checkRaceRefExists = function(entityRequest){
    var deferred = q.defer();

    Race.findById(entityRequest.newEntity.raceRef, function(err, model) {
        if (err) return deferred.reject("cannot check race ref");
        if (!model) return deferred.reject("cannot find race ref");
        return deferred.resolve(entityRequest);
    });

    return deferred.promise;
};

placingController.checkGreyhoundRefExists = function(entityRequest){
    var deferred = q.defer();

    Greyhound.findById(entityRequest.newEntity.greyhoundRef, function(err, model) {
        if (err) return deferred.reject("cannot check greyhound ref");
        if (!model) return deferred.reject("cannot find greyhound ref");
        return deferred.resolve(entityRequest);
    });

    return deferred.promise;
};

placingController.checkGreyhoundRefNotAlreadyUsed = function(entityRequest){
    var deferred = q.defer();
    var query = {"_id": {"$ne" : entityRequest.newEntity._id}, "raceRef":entityRequest.newEntity.raceRef, "greyhoundRef": entityRequest.newEntity.greyhoundRef};
    Placing.find(query, function(err, models) {
        if (err) return deferred.reject("cannot check placing");
        if (models.length > 0) return deferred.reject("cannot have same greyhound more then once in a single race");
        return deferred.resolve(entityRequest);
    });

    return deferred.promise;
};