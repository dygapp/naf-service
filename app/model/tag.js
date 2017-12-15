'use strict';
const { RequiredString } = require('../util/schema')
const Schema = require('mongoose').Schema;
const ObjectId = Schema.Types.ObjectId;

const SchemaDefine = {
  tagid: RequiredString(64),
  tagname: RequiredString(64),
  userlist: [ String ],
  partylist: [ Number ],
  tenant: RequiredString(64),
};

module.exports = app => {
  const { mongoose } = app;
  return mongoose.model('Tag', new mongoose.Schema(SchemaDefine), 'naf_user_tag');
};
