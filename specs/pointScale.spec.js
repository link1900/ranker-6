var request = require('supertest');
var mongoose = require('mongoose');
var chai = require('chai');
chai.should();
var expect = chai.expect;
var testHelper = require('./testHelper');

describe("Point Scale", function(){
    before(function (done) {
        testHelper.setup(done);
    });

    beforeEach(function(done){
        testHelper.loadPointScale(function(){
            testHelper.loadPointScaleValue(done);
        });
    });

    describe("Get", function(){
        it("many", function(done){
            testHelper.publicSession
                .get('/pointScale')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.length.should.be.above(0);
                    done();
                });
        });

        it("one by id", function(done){
            testHelper.publicSession
                .get('/pointScale/5340caa05c4ac1fdcd478171')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.name.should.equal("Group 1 Sprint");
                    done();
                });
        });
    });

    describe("Create", function(){
        it("is secured", function(done){
            var body = {name:"Group 2 Sprint"};
            testHelper.publicSession
                .post('/pointScale')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("with name", function(done){
            var body = {name:"Group 2 Sprint"};
            testHelper.authSession
                .post('/pointScale')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.name.should.equal("Group 2 Sprint");
                    done();
                });
        });
    });

    describe("Update", function(){
        it("is secured", function(done){
            var body = {name:"Group Updated"};
            testHelper.publicSession
                .put('/pointScale/5340caa05c4ac1fdcd478171')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("name", function(done){
            var body = {name:"Group 3 Sprint"};
            testHelper.authSession
                .put('/pointScale/5340caa05c4ac1fdcd478171')
                .send(body)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("name");
                    res.body.name.should.equal("Group 3 Sprint");
                    done();
                });
        });
    });

    describe("Delete", function() {
        it("is secure", function (done) {
            testHelper.publicSession
                .del('/pointScale/5340caa05c4ac1fdcd478171')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401, done);
        });

        it("existing", function (done) {
            testHelper.authSession
                .del('/pointScale/5340caa05c4ac1fdcd478171')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it("point scale value references are removed", function (done) {
            testHelper.publicSession
                .get('/pointScaleValue/5340cc015c4ac1fdcd478175')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res){
                    if (err){ throw err; }
                    res.body.should.have.property("pointScaleRef");
                    res.body.should.have.property("placing");
                    res.body.should.have.property("points");
                    res.body.pointScaleRef.should.equal("5340caa05c4ac1fdcd478171");
                    res.body.placing.should.equal(1);
                    res.body.points.should.equal(70);
                    testHelper.authSession
                        .del('/pointScale/5340caa05c4ac1fdcd478171')
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .end(function(err2, res2){
                            if (err2){ throw err2; }
                            testHelper.publicSession
                                .get('/pointScaleValue/5340cc015c4ac1fdcd478175')
                                .set('Accept', 'application/json')
                                .expect('Content-Type', /json/)
                                .expect(400, done);
                        });
                });
        });

        it("ranking query references are removed");
    });

    afterEach(function(done){
        testHelper.clearPointScale(function(){
            testHelper.clearPointScaleValue(done);
        });
    });

    after(function (done) {
        testHelper.tearDown(done);
    });
});
