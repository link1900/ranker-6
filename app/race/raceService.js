var raceService = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');
var Race = require('./race').model;
var Placing = require('../placing/placing').model;
var helper = require('../helper');
var mongoService = require('../mongoService');
var BatchJob = require('../batch/batchJob').model;
var BatchResult = require('../batch/batchResult').model;
var batchService = require('../batch/batchService');
var csv = require('csv');
var grid = require('gridfs-stream');
var gfs = grid(mongoose.connection.db);

raceService.raceBatchTypes = {
    importRaceCSV : "Import race csv"
};