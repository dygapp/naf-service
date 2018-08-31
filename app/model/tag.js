'use strict';
const { RequiredString } = require('naf-framework-mongoose/lib/model/schema');
const Schema = require('mongoose').Schema;

const SchemaDefine = {
  tagid: RequiredString(64),
  tagname: RequiredString(64),
  userlist: [ String ],
  partylist: [ Number ],
};
const schema = new Schema(SchemaDefine, { timestamps: true, 'multi-tenancy': true });
schema.index({ tagid: 1 });
schema.index({ tagname: 1 });
module.exports = app => {
  const { mongoose } = app;
  return mongoose.model('Tag', schema, 'naf_tag');
};
