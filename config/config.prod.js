'use strict';

module.exports = () => {
  const config = exports = {};

  // mq config
  config.amqp = {
    client: {
      hostname: '192.168.1.190',
    },
  };

  config.logger = {
    consoleLevel: 'INFO',
  };

  return config;
};
