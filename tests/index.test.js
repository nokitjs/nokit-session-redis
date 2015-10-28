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

    describe('#init', function () {
        it('可以正确初始化', function (done) {
            Session.init({
                configs: configs
            }, done);
        });
    });

    describe('#set', function () {
        it('可以正确设置值', function (done) {
            var session = new Session({
                configs: configs,
                sessionId: sessionId
            });
            session.set('test', '1', done);
        });
    });

    describe('#get', function () {
        it('可以正确获取值', function (done) {
            var session = new Session({
                configs: configs,
                sessionId: sessionId
            });
            session.get('test', function (err, value) {
                console.log(value);
                assert.equal(value, '1');
                done();
            });
        });
    });

});