/* global nokit */
var redis = require("redis");

var PREFIX = "session:";
var DEFAULT_TIMEOUT = 1800;

/**
 * session 类
 **/
function SessionRedis(server) {
    var self = this;
    self.server = server;
    self.sessionConfigs = server.configs.session;
}

/**
 * 静态初始化方法
 * 一般用于和 session 存储服务进行连接
 **/
SessionRedis.prototype.init = function (server, callback) {
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
SessionRedis.prototype._getObj = function (sessionId, callback) {
    var self = this;
    var storeKey = PREFIX + sessionId;
    SessionRedis.client.get(storeKey,
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
SessionRedis.prototype._setObj = function (sessionId, sessionObj, callback) {
    var self = this;
    var storeKey = PREFIX + sessionId;
    var sessionJson = JSON.stringify(sessionObj);
    SessionRedis.client.set(storeKey, sessionJson, function (err) {
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
SessionRedis.prototype.active = function (sessionId) {
    var self = this;
    var storeKey = PREFIX + sessionId;
    var ttl = (self.sessionConfigs.timeout || DEFAULT_TIMEOUT);
    SessionRedis.client.expire(storeKey, ttl);
    return self;
};

/**
 * 保存 session
 **/
SessionRedis.prototype.set = function (sessionId, name, value, callback) {
    var self = this;
    self._getObj(sessionId, function (sessionObj) {
        sessionObj[name] = value;
        self._setObj(sessionId, sessionObj, callback);
        self.active();
    });
    return self;
};

/**
 * 获取一个 seesion 值
 **/
SessionRedis.prototype.get = function (sessionId, name, callback) {
    var self = this;
    self._getObj(sessionId, function (sessionObj) {
        if (callback) {
            callback(sessionObj[name]);
        }
    });
    return self;
};

/**
 * 移除一个 session
 **/
SessionRedis.prototype.remove = function (sessionId, name, callback) {
    var self = this;
    self._getObj(sessionId, function (sessionObj) {
        sessionObj[name] = null;
        delete sessionObj[name];
        self._setObj(sessionId, sessionObj, callback);
    });
    return self;
};

module.exports = SessionRedis;
/*end*/