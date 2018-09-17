'use strict';

module.exports = () => {
  const config = exports = {};

  config.cluster = {
    listen: {
      port: 8001,
    },
  };

  // mongoose config
  config.mongoose = {
    url: 'mongodb://localhost:27018/naf',
    options: {
      useNewUrlParser: true,
      user: 'root',
      pass: 'Ziyouyanfa#@!',
      authSource: 'admin',
    },
  };

  config.logger = {
    consoleLevel: 'INFO',
  };

  return config;
};
