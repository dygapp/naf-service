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
    url: 'mongodb://192.168.18.100:27018/naf',
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

  config.logger = {
    consoleLevel: 'DEBUG',
  };

  return config;
};
