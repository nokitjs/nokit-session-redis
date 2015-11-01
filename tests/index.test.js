/* global it */
/* global describe */

var assert = require("assert");
var Session = require('../');

var configs = {
    session: {
        port: 6379,
        host: 'xhou.net'
    }
};

var sessionId = '12345';

describe('session-redis', function () {

    var session = new Session({
        "configs": configs
    });

    describe('#init', function () {
        it('初始化', function (done) {
            session.init(configs.session, function () {
                assert.notEqual(session.client, null);
                done();
            });
        });
    });

    describe('#save', function () {
        it('保存 session', function (done) {
            session.save(sessionId, { "name": "test" }, function () {
                done();
            });
        });
    });

    describe('#load', function () {
        it('加载 session', function (done) {
            session.load(sessionId, function (err, sessionObj) {
                console.log(sessionObj);
                assert.equal(sessionObj.name, 'test');
                done();
            });
        });
    });

});