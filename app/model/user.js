'use strict';
const { RequiredString, NullableString } = require('naf-framework-mongoose/lib/model/schema');
const Schema = require('mongoose').Schema;

const SchemaDefine = {
  userid: RequiredString(64),
  name: RequiredString(64),
  gender: NullableString(64),
  mobile: NullableString(64),
  telephone: NullableString(64),
  email: NullableString(128),
  department: [ Number ],
  order: [ Number ],
  position: NullableString(64),
  isleader: Number,
  enable: Number,
  passwd: NullableString(128),
  weixin: NullableString(64),
  attrs: Object,
};
const schema = new Schema(SchemaDefine, { timestamps: true, 'multi-tenancy': true });

module.exports = app => {
  const { mongoose } = app;
  return mongoose.model('User', schema, 'naf_user_info');
};
