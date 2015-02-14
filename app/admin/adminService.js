var adminService = module.exports = {};

var mongoose = require('mongoose');
var placingService = require('../placing/placingService');
var Ranking = mongoose.model('Ranking');
var User = require('../user/user').model;
var RankingSystem = mongoose.model('RankingSystem');
var Race = require('../race/race').model;
var GroupLevel = require('../groupLevel/groupLevel').model;
var Greyhound = require('../greyhound/greyhound').model;
var BatchJob = require('../batch/batchJob').model;
var BatchResult = require('../batch/batchResult').model;
var Invite = require('../invite/invite').model;
var File = require('../file/file').model;
var Chunk = require('../file/file').chunkModel;
var _ = require('lodash');
var helper = require('../helper');
var mongoService = require('../mongoService');
var Schema = mongoose.Schema;
var q = require('q');

adminService.removeAllGreyhounds = function(){
    return placingService.removeAll({}).then(function(){
        return mongoService.dropCollection(Greyhound);
    });
};

adminService.removeAllRaces = function(){
    return placingService.removeAll({}).then(function(){
        return mongoService.dropCollection(Race);
    });
};

adminService.removeAllBatchJobs = function(){
    return mongoService.dropCollection(BatchResult).then(function(){
        return mongoService.dropCollection(BatchJob);
    });
};

adminService.removeAllRankingSystems = function(){
    return mongoService.dropCollection(Ranking).then(function(){
        return mongoService.dropCollection(RankingSystem);
    });
};

adminService.removeAllFiles = function(){
    return mongoService.dropCollection(Chunk).then(function(){
        return mongoService.dropCollection(File);
    });
};

adminService.removeAllGroupLevels = function(){
    return mongoService.dropCollection(GroupLevel);
};

adminService.setupGroupLevel = function(){
    return mongoService.saveAll([
        new GroupLevel({name:"Group 1"}),
        new GroupLevel({name:"Group 2"}),
        new GroupLevel({name:"Group 3"})
    ]);
};

adminService.setupRankingSystemDefaults = function(){
    var agraRankerFiscal = {
        name: "AGRA Ranking (Fiscal year)",
        description: "The main ranking system for agra",
        equalPositionResolution: "splitPoints",
        defaultRanking: true,
        pointAllotments:[],
        commonCriteria: [
            {field: "race.disqualified", "comparator": "=", "value": false, type: "Boolean"},
            {field: "race.date", "comparator": ">=", "value": "currentFinancialYearStart", type: "Date"},
            {field: "race.date", "comparator": "<=", "value": "currentFinancialYearEnd", type: "Date"}
        ]
    };

    //sprint group
    var baseSprint = [{field: "race.distanceMeters", "comparator": "<", "value": 595, type: "Number"}];
    var group1Sprint = [{field: "race.groupLevel.name", "comparator": "=", "value": "Group 1", type: "Text"}].concat(baseSprint);
    var group2Sprint = [{field: "race.groupLevel.name", "comparator": "=", "value": "Group 2", type: "Text"}].concat(baseSprint);
    var group3Sprint = [{field: "race.groupLevel.name", "comparator": "=", "value": "Group 3", type: "Text"}].concat(baseSprint);
    agraRankerFiscal.pointAllotments = agraRankerFiscal.pointAllotments.concat(adminService.generateAllotmentSet([70, 35, 20, 15, 10, 8, 7, 6], group1Sprint));
    agraRankerFiscal.pointAllotments = agraRankerFiscal.pointAllotments.concat(adminService.generateAllotmentSet([40, 25, 15, 10, 8, 7, 6, 5], group2Sprint));
    agraRankerFiscal.pointAllotments = agraRankerFiscal.pointAllotments.concat(adminService.generateAllotmentSet([25, 16, 12, 8, 6, 5, 4, 3], group3Sprint));

    //stay groups
    var baseStay = [{field: "race.distanceMeters", "comparator": ">=", "value": 595, type: "Number"}];
    var group1Stay = [{field: "race.groupLevel.name", "comparator": "=", "value": "Group 1", type: "Text"}].concat(baseStay);
    var group2Stay = [{field: "race.groupLevel.name", "comparator": "=", "value": "Group 2", type: "Text"}].concat(baseStay);
    var group3Stay = [{field: "race.groupLevel.name", "comparator": "=", "value": "Group 3", type: "Text"}].concat(baseStay);
    agraRankerFiscal.pointAllotments = agraRankerFiscal.pointAllotments.concat(adminService.generateAllotmentSet([50, 25, 16, 12, 8, 6, 4, 2], group1Stay));
    agraRankerFiscal.pointAllotments = agraRankerFiscal.pointAllotments.concat(adminService.generateAllotmentSet([30, 20, 12, 8, 6, 4, 2, 1], group2Stay));
    agraRankerFiscal.pointAllotments = agraRankerFiscal.pointAllotments.concat(adminService.generateAllotmentSet([20, 14, 10, 6, 4, 3, 2, 1], group3Stay));

    var agraRankerCalendar = _.cloneDeep(agraRankerFiscal);
    agraRankerCalendar.name ="AGRA Ranking (Calendar year)";
    agraRankerCalendar.commonCriteria = [
        {field: "race.disqualified", "comparator": "=", "value": false, type: "Boolean"},
        {field: "race.date", "comparator": ">=", "value": "currentCalendarYearStart", type: "Date"},
        {field: "race.date", "comparator": "<=", "value": "currentCalendarYearEnd", type: "Date"}
    ];

    return mongoService.saveAll([
        new RankingSystem(agraRankerFiscal),
        new RankingSystem(agraRankerCalendar)
    ]);
};

adminService.generateAllotmentSet = function(pointArray, defaultCriteria){
    return pointArray.map(function(pointValue, index){
        var newCriteria = defaultCriteria.slice();
        newCriteria.push({field: "placing", "comparator": "=", "value": (index+1).toString(), type: "Text"});
        return {
            points: pointValue,
            criteria:newCriteria
        };
    })
};

adminService.getAllCounts = function(){
    var proms = [
        mongoService.getCollectionCount(User).then(function(count){
            return {"user": count};
        }),
        mongoService.getCollectionCount(Greyhound).then(function(count){
            return {"greyhound": count};
        }),
        placingService.count().then(function(count){
            return {"placing": count};
        }),
        mongoService.getCollectionCount(GroupLevel).then(function(count){
            return {"groupLevel": count};
        }),
        mongoService.getCollectionCount(Race).then(function(count){
            return {"race": count};
        }),
        mongoService.getCollectionCount(Invite).then(function(count){
            return {"invite": count};
        }),
        mongoService.getCollectionCount(RankingSystem).then(function(count){
            return {"rankingSystem": count};
        }),
        mongoService.getCollectionCount(BatchResult).then(function(count){
            return {"batchJob": count};
        }),
        mongoService.getCollectionCount(BatchJob).then(function(count){
            return {"batchResult": count};
        }),
        mongoService.getCollectionCount(File).then(function(count){
            return {"file": count};
        }),
        mongoService.getCollectionStats(Chunk).then(function(stats){
            return {"fileSize":stats.size};
        })
    ];

    return q.allSettled(proms).then(function(results){
        var counts = results.map(function(promResult){return promResult.value;});
        return counts.reduce(function(previousValue, currentValue) {
            return _.merge(previousValue, currentValue);
        }, {});
    });
};