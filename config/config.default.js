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

  // mongoose config
  config.mongoose = {
    url: 'mongodb://localhost:27017/naf',
    options: {
      useNewUrlParser: true,
      user: 'root',
      pass: 'Ziyouyanfa#@!',
      authSource: 'admin',
    },
  };

  config.onerror = ErrorConfig;

  return config;
};
