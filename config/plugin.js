'use strict';

// had enabled by egg
// exports.static = true;
exports.multiTenancy = {
  enable: true,
};

exports.amqp = {
  enable: true,
  package: 'egg-naf-amqp',
};

exports.redis = {
  enable: true,
  package: 'egg-redis',
};
