'use strict';
const { RequiredString } = require('../util/schema');

const SchemaDefine = {
  _id: RequiredString(64),
  value: Number,
};

module.exports = app => {
  const { mongoose } = app;
  return mongoose.model('Sequence', new mongoose.Schema(SchemaDefine), 'naf_seq');
};
