'use strict';

var placingController = module.exports = {};

var mongoose = require('mongoose');
var Placing = mongoose.model('Placing');
var Race = mongoose.model('Race');
var Greyhound = mongoose.model('Greyhound');
var _ = require('lodash');
var helper = require('../helper');
var q = require('q');

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
    var like = req.param('like');
    var name = req.param('name');
    if (like){
        req.searchQuery = {'name': {'$regex': like.toLowerCase()}};
    }
    if (name){
        req.searchQuery = {'name': name.toLowerCase()};
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
        .then(helper.saveEntityRequest);

    helper.promiseToResponse(processChain, res);
};

placingController.destroy = function(req, res) {
    helper.responseFromPromise(res, helper.remove(req.model));
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

    if (model.placing < 1 || model.placing > 30){
        return q.reject("placing must be between 1 and 30");
    }

    if (!model.raceRef){
        return q.reject("raceRef field is required");
    }

    if (!model.greyhoundRef){
        return q.reject("greyhoundRef field is required");
    }

    return placingController.checkRaceRefExists(entityRequest).then(
        placingController.checkGreyhoundRefExists
    );
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