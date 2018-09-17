'use strict';
/**
 * 标签（非多租户）
 */
const { RequiredString } = require('naf-framework-mongoose/lib/model/schema');
const Schema = require('mongoose').Schema;

const SchemaDefine = {
  unitid: RequiredString(64),
  unitname: RequiredString(64),
};
const schema = new Schema(SchemaDefine, { timestamps: true });
schema.index({ unitid: 1 });
schema.index({ unitname: 1 });
module.exports = app => {
  const { mongoose } = app;
  return mongoose.model('Unit', schema, 'naf_unit');
};
