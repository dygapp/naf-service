'use strict';
const { RequiredString } = require('../util/schema');
const Schema = require('mongoose').Schema;

const SchemaDefine = {
  tagid: RequiredString(64),
  tagname: RequiredString(64),
  userlist: [ String ],
  partylist: [ Number ],
  tenant: RequiredString(64),
};
const schema = new Schema(SchemaDefine);
schema.index({ tenant: 1, tarid: 1 });
schema.index({ tenant: 1, tarname: 1 });
module.exports = app => {
  const { mongoose } = app;
  return mongoose.model('Tag', schema, 'naf_user_tag');
};
