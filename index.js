/* global nokit */
var redis = require("redis");

var PREFIX = "session:";
var DEFAULT_TIMEOUT = 30;

/**
 * session 类
 **/
function Session(context) {
    var self = this;
    self.configs = context.configs;
    self.sessionId = context.sessionId;
    self.client = Session.client;
    self.key = PREFIX + self.sessionId;
};

/**
 * 初始化 session provider
 **/
Session.init = function (server, callback) {
    var self = Session;
    var configs = server.configs.session;
    self.client = redis.createClient(configs.port, configs.host, configs.options);
    if (configs.auth) {
        self.client.auth(configs.auth.password, callback);
    } else {
        if (callback) callback();
    }
    return self;
};

/**
 * 更新最后活动时间
 **/
Session.prototype.active = function (callback) {
    var self = this;
    var ttl = (self.configs.timeout || DEFAULT_TIMEOUT) * 60;
    self.client.expire(self.key, ttl, callback);
    return self;
};

/**
 * 获取一个 seesion 值
 **/
Session.prototype.get = function (name, callback) {
    var self = this;
    self.client.get(self.key, function (err, json) {
        if (err) {
            callback(err);
            return self;
        } else {
            var obj = JSON.parse(json || '{}');
            callback(null, obj[name]);
        }
    });
    return self;
};

/**
 * 设置一个 seesion
 **/
Session.prototype.set = function (name, value, callback) {
    var self = this;
    self.client.get(self.key, function (err, json) {
        if (err) {
            callback(err);
            return self;
        } else {
            var obj = JSON.parse(json || '{}');
            obj[name] = value;
            self.client.set(self.key, JSON.stringify(obj), function (err, rs) {
                callback(err, rs);
                self.active();
            });
        }
    });
    return self;
};

/**
 * 移除一个 session
 **/
Session.prototype.remove = function (name, callback) {
    var self = this;
    self.set(name, null, callback);
    return self;
};

module.exports = Session;
/*end*/