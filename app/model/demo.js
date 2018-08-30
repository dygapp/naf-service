'use strict';
const Schema = require('mongoose').Schema;

const SchemaDefine = {
  key: String,
  val: String,
};
const schema = new Schema(SchemaDefine);
module.exports = app => {
  const { mongoose } = app;
  return mongoose.model('Demo', schema, 'naf_demo');
};
