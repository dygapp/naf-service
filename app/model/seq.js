'use strict';
const SchemaDefine = require('naf-framework-mongoose/lib/model/seq');

module.exports = app => {
  const { mongoose } = app;
  return mongoose.model('Seq', new mongoose.Schema(SchemaDefine), 'naf_seq');
};
