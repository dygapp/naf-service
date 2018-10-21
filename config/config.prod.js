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
      hostname: '192.168.1.190',
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
    consoleLevel: 'INFO',
  };

  return config;
};
