'use strict';
/**
 * 单位（非多租户）
 */
const { RequiredString } = require('naf-framework-mongoose/lib/model/schema');
const Schema = require('mongoose').Schema;

const SchemaDefine = {
  code: RequiredString(64),
  name: RequiredString(64),
};
const schema = new Schema(SchemaDefine, { timestamps: true });
schema.index({ code: 1 });
schema.index({ name: 1 });
module.exports = app => {
  const { mongoose } = app;
  return mongoose.model('Unit', schema, 'naf_unit');
};
