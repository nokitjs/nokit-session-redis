/* global nokit */
var redis = require("redis");

var PREFIX = "session:";
var TIMEOUT = 30;

/**
 * session 类
 **/
function SessionRedis(context) {
    var self = this;
    self.context = context;
    self.sessionConfigs = context.configs.session;
    self.sessionId = self.context.sessionId;
    self.storeKey = PREFIX + self.sessionId;
}

/**
 * 静态初始化方法
 * 一般用于和 session 存储服务进行连接
 **/
SessionRedis.init = function (server, callback) {
    var self = SessionRedis;
    var sessionConfigs = server.configs.session;
    self.client = redis.createClient(sessionConfigs.port,
        sessionConfigs.host,
        sessionConfigs.options);
    if (sessionConfigs.auth) {
        self.client.auth(sessionConfigs.auth.password, callback);
    } else {
        if (callback) callback();
    }
    return self;
};

/**
 * 读取对象私有方法
 **/
SessionRedis.prototype._getObj = function (callback) {
    var self = this;
    SessionRedis.client.get(self.storeKey,
        function (err, json) {
            if (err) {
                throw err;
            }
            var sessionObj = JSON.parse(json || '{}');
            if (callback) {
                callback(sessionObj);
            }
        });
    return self;
};

/**
 * 保存对象私有方法
 **/
SessionRedis.prototype._setObj = function (sessionObj, callback) {
    var self = this;
    var sessionJson = JSON.stringify(sessionObj);
    SessionRedis.client.set(self.storeKey, sessionJson, function (err) {
        if (err) {
            throw err;
        }
        if (callback) {
            callback();
        }
    });
    return self;
};

/**
 * 保持活动状态
 **/
SessionRedis.prototype.active = function () {
    var self = this;
    var ttl = (self.sessionConfigs.timeout || TIMEOUT) * 60;
    SessionRedis.client.expire(self.storeKey, ttl);
    return self;
};

/**
 * 保存 session
 **/
SessionRedis.prototype.set = function (name, value, callback) {
    var self = this;
    self._getObj(function (sessionObj) {
        sessionObj[name] = value;
        self._setObj(sessionObj, callback);
        self.active();
    });
    return self;
};

/**
 * 获取一个 seesion 值
 **/
SessionRedis.prototype.get = function (name, callback) {
    var self = this;
    self._getObj(function (sessionObj) {
        if (callback) {
            callback(sessionObj[name]);
        }
    });
    return self;
};

/**
 * 移除一个 session
 **/
SessionRedis.prototype.remove = function (name, callback) {
    var self = this;
    self._getObj(function (sessionObj) {
        sessionObj[name] = null;
        delete sessionObj[name];
        self._setObj(sessionObj, callback);
    });
    return self;
};

module.exports = SessionRedis;
/*end*/