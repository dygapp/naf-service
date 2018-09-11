'use strict';

module.exports = () => {
  const config = exports = {};

  config.cluster = {
    listen: {
      port: 7001,
    },
  };

  config.logger = {
    consoleLevel: 'DEBUG',
  };

  return config;
};
