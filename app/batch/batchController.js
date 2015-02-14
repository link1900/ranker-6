'use strict';
var batchController = module.exports = {};

var mongoose = require('mongoose');
var BatchJob = require('./batchJob').model;
var BatchResult = require('./batchResult').model;

var _ = require('lodash');
var helper = require('../helper');
var mongoService = require('../mongoService');
var q = require('q');
var batchService = require('./batchService');


batchController.setBatch = function(req, res, next, id) {
    BatchJob.findById(id, function(err, model) {
        if (err) return next(err);
        if (!model) return next(new Error('Failed to load batch ' + id));
        req.model = model;
        req.previousModel = _.clone(model.toObject());
        return next();
    });
};

batchController.setBatchResult = function(req, res, next, id) {
    BatchResult.findById(id, function(err, model) {
        if (err) return next(err);
        if (!model) return next(new Error('Failed to load batch result' + id));
        req.model = model;
        req.previousModel = _.clone(model.toObject());
        return next();
    });
};

batchController.prepareBatchQuery = function(req, res, next) {
    req.searchQuery = {};
    var like = req.param('like');
    var type = req.param('name');
    if (like){
        req.searchQuery = {'type': {'$regex': like, '$options' : 'i'}};
    }
    if (type){
        req.searchQuery = {'type': type};
    }
    req.dao = BatchJob;
    next();
};

batchController.destroy = function(req, res) {
    //clean up batch records
    BatchResult.remove({'batchRef': req.model._id}, function(childErr){
        if (childErr != null){
            res.jsonp(400, {'error':childErr.errors});
        } else {
            req.model.remove(function(err, removedModel) {
                if (err) {
                    res.jsonp(400, {'error':err.errors});
                } else {
                    res.jsonp(200, removedModel);
                }
            });
        }
    });
};

batchController.checkFields = function(req, res, next){
    if (req.previousModel.status == batchService.batchStatuses.awaitingProcessing && req.model.status == batchService.batchStatuses.cancelled){
        return next();
    } else {
        return res.jsonp(400, {'error':'you are only allowed edit a batch by cancelling it'});
    }
};

batchController.totalForBatch = function(req, res){
    var pipeline =[
        {$match : {batchRef: req.model._id}},
        {
            $project : {
                duration : {$subtract :["$endDate","$startDate"]},
                success : {$cond: { if: {$eq : ["$status","Success"]}, then: 1, else: 0 }},
                failure : {$cond: { if: {$eq : ["$status","Failed"]}, then: 1, else: 0 }}
            }
        },
        {$group: { '_id': {'batchRef' : "$batchRef"}, 'totalDuration' : { '$sum' : "$duration" }, totalSuccess : { '$sum' : "$success" }, totalFailure : { '$sum' : "$failure" }}}
    ];
    helper.responseFromPromise(res,  mongoService.aggregateSinglePromise(BatchResult, pipeline));
};