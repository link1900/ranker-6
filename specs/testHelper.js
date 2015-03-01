var testHelper = module.exports = {};
var request = require('supertest');
var siteUrl = process.env.testUrl;
var mongoose = require('mongoose');
var moment = require('moment');
var mongoService = require('../app/mongoService');
var User = require('../app/user/user').model;
var GroupLevel = require('../app/groupLevel/groupLevel').model;
var RankingSystem = require('../app/ranking/rankingSystem').model;
var Race = require('../app/race/race').model;
var Greyhound = require('../app/greyhound/greyhound').model;
var Placing = require('../app/placing/placing').model;
var Invite = require('../app/invite/invite').model;
testHelper.publicSession = request.agent(siteUrl);
testHelper.authSession = request.agent(siteUrl);
server = require("../server.js");

testHelper.login = function(agent , done){
    var cred = {email: 'link1900@gmail.com', password: 'tester'};
    agent
        .post('/login')
        .send(cred)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
};

testHelper.logout = function(agent , done){
    var cred = {email: 'link1900@gmail.com', password: 'tester'};
    agent
        .post('/logout')
        .send(cred)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done);
};

testHelper.setup = function(done){
    server.start().then(function(){
        testHelper.loadUsers(function(){
            testHelper.login(testHelper.authSession, done);
        });
    });
};

testHelper.tearDown = function(done){
    testHelper.clearUsers(function(){
        testHelper.logout(testHelper.authSession, done);
    });
};

testHelper.letter1000 = "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789" +
    "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789" +
    "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789" +
    "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789" +
    "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789" +
    "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789" +
    "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789" +
    "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789" +
    "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789" +
    "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789" +
    "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789";


testHelper.loadInvites = function(done){
    new Invite({
        "email" : "lilly@gmail.com",
        "token": "inviteToken1",
        "expiry" : moment().add(5, 'd').toDate(),
        "_id" : "5475a85de622166913516271"
    }).save(function(){
            new Invite({
                "email" : "oldinvite@gmail.com",
                "token": "inviteToken2",
                "expiry" : moment().subtract(5, 'd').toDate(),
                "_id" : "5475b7e6e622166913516273"
            }).save(done);
        });
};

testHelper.dropInvites = function(done){
    Invite.remove({}, function(){
        done();
    });
};

testHelper.loadUsers = function(done){
    var docs = [];
    docs.push(new User({
        "provider" : "local",
        "email" : "link1900@gmail.com",
        "firstName": "link",
        "lastName": "1900",
        "password" : "tester",
        "state" : "Active",
        "_id" : "532675365d68bab8234c7e7f"
    }));

    docs.push(new User({
        "provider" : "local",
        "email" : "joe@gmail.com",
        "firstName": "joe",
        "lastName": "doe",
        "password" : "tester",
        "state" : "Active",
        "_id" : "54683fd3daad610cccdd34da"
    }));

    docs.push(new User({
        "provider" : "local",
        "email" : "newuser@gmail.com",
        "firstName": "new",
        "lastName": "user",
        "password" : "tester",
        "state" : "Requested Access",
        "_id" : "5469d48ddaad610cccdd34db"
    }));

    docs.push(new User({
        "provider" : "local",
        "email" : "needpassword@gmail.com",
        "firstName": "need",
        "lastName": "password",
        "password" : "tester",
        "state" : "Active",
        "passwordReset":{
            tokenCreated: new Date(),
            token: "123a",
            expirationDate: moment().add(5, 'd').toDate()
        },
        "_id" : "546ff82ddaad610cccdd34de"
    }));

    docs.push(new User({
        "provider" : "local",
        "email" : "needpasswordexpire@gmail.com",
        "firstName": "need",
        "lastName": "password",
        "password" : "tester",
        "state" : "Active",
        "passwordReset":{
            tokenCreated: new Date(),
            token: "123b",
            expirationDate: new Date()
        },
        "_id" : "546ff836daad610cccdd34df"
    }));

    mongoService.createMany(docs).then(function(){
        done();
    }, function(err){
        done(err);
    });
};

testHelper.clearUsers = function(done){
    User.remove({}, done);
};

testHelper.loadGroupLevels = function(done){
    GroupLevel.remove({}, function(){
        new GroupLevel({"_id" : "531d1f72e407586c21476ef7",
            "name" : "Group 1",
            "level":1}).save(function(){
                new GroupLevel({"_id" : "531d1f72e407586c21476f0c",
                    "name" : "Group 2",
                    "level": 2}).save(function(){
                        new GroupLevel({"_id" : "531d1f72e407586c21476f0d",
                            "name" : "Group 3",
                            "level": 2}).save(done);
                    });
            });
    });
};

testHelper.loadRankingSystem = function(done){
    RankingSystem.remove({}, function(){
        new RankingSystem({"_id" : "5340bfc15c4ac1fdcd47816d",
            "name" : "Test Ranking System",
            "description":"test Rankings"}).save(function(){
                new RankingSystem({"_id" : "53411feb5c4ac1fdcd47817d",
                    "name" : "Mega Ranking System",
                    "description":"test rankings"}).save(function(){
                        new RankingSystem(    {
                            "_id" : "53412feb5c4ac1fdcd4781ff",
                            "name": "Agra Rankings",
                            "description": "The main ranking system for agra",
                            "equalPositionResolution": "splitPoints",
                            "pointAllotments":[
                                {
                                    criteria: [
                                        {field: "placing", "comparator": "=", "value": "1"}
                                    ],
                                    points: 70
                                }
                            ]
                        }).save(done);
                    });
            });
    });
};

testHelper.clearRankingSystems = function(done){
    RankingSystem.remove({}, done);
};

testHelper.clearGroupLevels = function(done){
    GroupLevel.remove({}, done);
};

testHelper.loadRaces = function(done){
    testHelper.loadGroupLevels(function(){
        Race.remove({}, function(){
            new Race({"_id" : "531d1f72e407586c21476ea8",
                "name" : "race1",
                "date": new Date(),
                "groupLevelRef":"531d1f72e407586c21476ef7",
                "groupLevel" : {"name" : "Group 1", "level":1},
                "distanceMeters": 515,
                "disqualified":false}).save(function(){
                    new Race({"_id" : "531d1f72e407586c21476ec4",
                        "name" : "Race2",
                        "date": new Date(),
                        "groupLevelRef":"531d1f72e407586c21476f0c",
                        "distanceMeters": 715,
                        "disqualified":false}).save(function(){
                            new Race({"_id" : "531d1f72e407586c21476e52",
                                "name" : "Race3",
                                "date": new Date(2014,5,5),
                                "groupLevelRef":"531d1f72e407586c21476f0c",
                                "distanceMeters": 715,
                                "disqualified":false}).save(done);
                        });
                });
        });
    });
};

testHelper.clearRaces = function(done){
    testHelper.clearGroupLevels(function(){
        Race.remove({}, done);
    });
};

testHelper.loadGreyhounds = function(done){
    Greyhound.remove({}, function(){
        new Greyhound({"_id" : "53340c2d8e791cd5d7c731d7", "name" : "grey1"}).save();
        new Greyhound({"_id":'531d1f74e407586c2147737b', name:"grey2"}).save();
        new Greyhound({"_id":'53407b9d5c4ac1fdcd47816a', name:"grey5"}).save();
        new Greyhound({"_id":'531d1f72e407586c21476e49', name:"grey4", sireRef:"53340c2d8e791cd5d7c731d7", damRef:"531d1f74e407586c2147737b"}).save();
        new Greyhound({"_id":'531d1f74e407586c214773df', name:"grey3"}).save(done);
    });
};

testHelper.clearGreyhounds = function(done){
    Greyhound.remove({}, done);
};

testHelper.loadPlacings = function(done){
    testHelper.loadRaces(function(){
        testHelper.loadGreyhounds(function(){
            Placing.remove({}, function(){
                new Placing({"_id" : "531d1f82e407586c21476eb9",
                    "placing" : "2",
                    "raceRef": "531d1f72e407586c21476ea8",
                    "greyhoundRef":"531d1f74e407586c2147737b"}).save();
                new Placing({"_id" : "531d1f82e407586c21476dc9",
                    "placing" : "3",
                    "raceRef": "531d1f72e407586c21476ea8",
                    "greyhoundRef":"53407b9d5c4ac1fdcd47816a"}).save();
                new Placing({"_id" : "531d1f82e407586c21476ea9",
                    "placing" : "1",
                    "raceRef": "531d1f72e407586c21476ea8",
                    "greyhoundRef":"53340c2d8e791cd5d7c731d7"}).save(done);
            });
        });
    });
};

testHelper.setupRankingTestData = function(done){
    var rankingSystem1 = {
        _id: "54ac8b031ee51022d545c8fc",
        "name": "Test ranking system",
        "description": "Test ranking system",
        equalPositionResolution: "splitPoints",
        commonCriteria: [
            {field: "race.disqualified", "comparator": "=", "value": false}
        ],
        pointAllotments: [{
            criteria: [
                {field: "placing", "comparator": "=", "value": "1"},
                {field: "race.groupLevel.name", "comparator": "=", "value": "Group 3"},
                {field: "race.distanceMeters", "comparator": "<", "value": 715}
            ],
            points: 20
        },{
            criteria: [
                {field: "placing", "comparator": "=", "value": "2"},
                {field: "race.groupLevel.name", "comparator": "=", "value": "Group 3"},
                {field: "race.distanceMeters", "comparator": "<", "value": 715}
            ],
            points: 10
        },{
            criteria: [
                {field: "placing", "comparator": "=", "value": "3"},
                {field: "race.groupLevel.name", "comparator": "=", "value": "Group 3"},
                {field: "race.distanceMeters", "comparator": "<", "value": 715}
            ],
            points: 5
        }]
    };

    var john = {
        _id: '54ac8d5e1ee51022d545c8fe',
        name: "john"
    };
    var sally = {
        _id: '54ac8da71ee51022d545c900',
        name: "sally"
    };
    var molly = {
        _id: '54ac8dac1ee51022d545c901',
        name: "molly"
    };
    var jane = {
        _id: '54ac8db01ee51022d545c902',
        name: "jane"
    };

    var rankingRace1 = {
        "_id": "54ac8e011ee51022d545c904",
        "distanceMeters": 500,
        "groupLevel": {
            "name": "Group 3",
            "_id": "54ac8dce1ee51022d545c903"
        },
        "groupLevelRef": "54ac8dce1ee51022d545c903",
        "name": "rankingRace1",
        date: new Date(2014,8,8),
        "disqualified": false
    };
    var rankingRace2 = {
        "_id": "54ac8e1a1ee51022d545c905",
        "distanceMeters": 500,
        "groupLevel": {
            "name": "Group 3",
            "_id": "54ac8dce1ee51022d545c903"
        },
        "groupLevelRef": "54ac8dce1ee51022d545c903",
        "name": "rankingRace1",
        date: new Date(2014,8,8),
        "disqualified": false
    };
    var rankingRace3 = {
        "_id": "54ac8e221ee51022d545c906",
        "distanceMeters": 500,
        "groupLevel": {
            "name": "Group 3",
            "_id": "54ac8dce1ee51022d545c903"
        },
        "groupLevelRef": "54ac8dce1ee51022d545c903",
        "name": "rankingRace1",
        date: new Date(2012,8,8),
        "disqualified": false
    };

    var johnRankingRace1 = {
        "greyhound": john,
        "race": rankingRace1,
        "placing": "1",
        _id:"54aca1da1ee51022d545c909",
        "raceRef": rankingRace1._id,
        "greyhoundRef": john._id
    };

    var johnRankingRace1Ref = {
        "placingRef": "54aca1da1ee51022d545c909",
        "points": 20,
        "position": "1",
        "race": {
            "name": rankingRace1.name
        }
    };

    var sallyRankingRace1 = {
        "greyhound": sally,
        "race": rankingRace1,
        "placing": "2",
        _id:"54aca2661ee51022d545c90a",
        "raceRef": rankingRace1._id,
        "greyhoundRef": sally._id
    };

    var sallyRankingRace1Ref = {
        "placingRef": "54aca2661ee51022d545c90a",
        "points": 10,
        "position": "2",
        "race": {
            "name": rankingRace1.name
        }
    };

    var mollyRankingRace1 = {
        "greyhound": molly,
        "race": rankingRace1,
        _id:"54aca2721ee51022d545c90b",
        "placing": "3",
        "raceRef": rankingRace1._id,
        "greyhoundRef": molly._id
    };

    var mollyRankingRace1Ref = {
        "placingRef": "54aca2721ee51022d545c90b",
        "points": 5,
        "position": "3",
        "race": {
            "name": rankingRace1.name
        }
    };

    var johnRankingRace2 = {
        "greyhound": john,
        "race": rankingRace2,
        _id:"54aca27e1ee51022d545c90c",
        "placing": "1",
        "raceRef": rankingRace2._id,
        "greyhoundRef": john._id
    };

    var johnRankingRace2Ref = {
        "placingRef": "54aca27e1ee51022d545c90c",
        "points": 20,
        "position": "1",
        "race": {
            "name": rankingRace2.name
        }
    };

    var janeRankingRace2 = {
        "greyhound": jane,
        "race": rankingRace2,
        _id:"54aca28f1ee51022d545c90d",
        "placing": "2",
        "raceRef": rankingRace2._id,
        "greyhoundRef": jane._id
    };

    var janeRankingRace2Ref = {
        "placingRef": "54aca28f1ee51022d545c90d",
        "points": 10,
        "position": "2",
        "race": {
            "name": rankingRace2.name
        }
    };

    var johnRankingRace3 = {
        "greyhound": john,
        "race": rankingRace3,
        _id:"54aca29d1ee51022d545c90e",
        "placing": "1",
        "raceRef": rankingRace3._id,
        "greyhoundRef": john._id
    };

    var johnRankingRace3Ref = {
        "placingRef": "54aca29d1ee51022d545c90e",
        "points": 20,
        "position": "1",
        "race": {
            "name": rankingRace3.name
        }
    };
    Placing.remove({}, function(){
        new Placing(johnRankingRace1).save(function(){
            new Placing(sallyRankingRace1).save(function(){
                new Placing(mollyRankingRace1).save(function(){
                    new Placing(janeRankingRace2).save(function(){
                        new Placing(johnRankingRace2).save(function(){
                            new Placing(johnRankingRace3).save(function(){
                                new RankingSystem(rankingSystem1).save(function(){
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};

testHelper.removeRankingData = function(done){
    RankingSystem.remove({}, function(){
        Placing.remove({}, function(){
            done();
        });
    })
};

testHelper.clearPlacings = function(done){
    Placing.remove({}, function(){
        testHelper.clearRaces(function(){
            testHelper.clearGreyhounds(done);
        });
    });
};