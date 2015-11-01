/* global nokit */
var redis = require("redis");

var PREFIX = "session:";
var TIMEOUT = 30;

/**
 * session 类
 **/
function SessionRedis(server) {
    var self = this;
    self.configs = server.configs.session;
};

/**
 * 初始化 session provider
 **/
SessionRedis.prototype.init = function (configs, callback) {
    var self = this;
    self.client = redis.createClient(configs.port, configs.host, configs.options);
    if (configs.auth) {
        self.client.auth(configs.auth.password, callback);
    } else {
        if (callback) callback();
    }
    return self;
};

/**
 * 保存 session
 **/
SessionRedis.prototype.save = function (sessionId, sessionObj, callback) {
    var self = this;
    self.client.set(PREFIX + sessionId,
        JSON.stringify(sessionObj),
        function (err, rs) {
            if (err) {
                callback(err);
                return self;
            }
            var ttl = (self.configs.timeout || TIMEOUT) * 60;
            self.client.expire(self.key, ttl);
            callback(err, rs);
        });
    return self;
};

/**
 * 获取一个 seesion 值
 **/
SessionRedis.prototype.load = function (sessionId, callback) {
    var self = this;
    self.client.get(PREFIX + sessionId,
        function (err, json) {
            if (err) {
                callback(err);
                return self;
            }
            var sessionObj = JSON.parse(json || '{}');
            callback(null, sessionObj);
        });
    return self;
};

module.exports = SessionRedis;
/*end*/