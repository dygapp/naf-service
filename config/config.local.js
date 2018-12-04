'use strict';

module.exports = () => {
  const config = exports = {};

  // mongoose config
  config.mongoose = {
    url: 'mongodb://192.168.18.100:27018/naf',
    // url: 'mongodb://192.168.1.170:27018/naf',
  };

  // mq config
  config.amqp = {
    client: {
      hostname: '192.168.18.100',
      // hostname: '192.168.1.190',
    },
  };

  // redis config
  config.redis = {
    client: {
      host: '192.168.18.100', // Redis host
      // host: '192.168.1.170', // Redis host
    },
  };

  config.logger = {
    consoleLevel: 'DEBUG',
  };

  return config;
};
