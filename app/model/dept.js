'use strict';
const { RequiredString } = require('../util/schema');
const Schema = require('mongoose').Schema;

const SchemaDefine = {
  id: { type: Number, required: true, index: true },
  parentid: { type: Number, required: true, index: true },
  name: RequiredString(64),
  order: Number,
  tenant: RequiredString(64),
};
const schema = new Schema(SchemaDefine);
schema.index({ tenant: 1, id: 1 });
schema.index({ tenant: 1, parentid: 1 });

module.exports = app => {
  const { mongoose } = app;
  return mongoose.model('Department', schema, 'naf_user_dept');
};
