'use strict';

const ErrorConfig = require('./config.error.js');

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1512517259953_9547';

  // add your config here
  config.middleware = [];

  // 安全配置
  config.security = {
    csrf: {
      // ignoreJSON: true, // 默认为 false，当设置为 true 时，将会放过所有 content-type 为 `application/json` 的请求
      enable: false,
    },
  };

  config.jwt = {
    secret: 'Ziyouyanfa!@#',
    expiresIn: '1h',
    issuer: 'platform',
  };

  config.onerror = ErrorConfig;

  // server config
  config.cluster = {
    listen: {
      port: 8001,
    },
  };

  // mongoose config
  config.mongoose = {
    url: 'mongodb://localhost:27018/naf',
    options: {
      user: 'root',
      pass: 'Ziyouyanfa#@!',
      authSource: 'admin',
      useNewUrlParser: true,
      useCreateIndex: true,
    },
  };

  // mq config
  config.amqp = {
    client: {
      hostname: '127.0.0.1',
      username: 'smart',
      password: 'smart123',
      vhost: 'smart',
    },
    app: true,
    agent: true,
  };

  // redis config
  config.redis = {
    client: {
      port: 6379, // Redis port
      host: '127.0.0.1', // Redis host
      password: null,
      db: 0,
    },
  };

  return config;
};
