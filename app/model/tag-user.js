'use strict';
/**
 * 标签用户（多租户）
 */
const Schema = require('mongoose').Schema;

const SchemaDefine = {
  tagid: { type: Number, required: true, index: true },
  userlist: [ String ],
  partylist: [ Number ],
};
const schema = new Schema(SchemaDefine, { timestamps: true, 'multi-tenancy': true });
schema.index({ tagid: 1 });
schema.index({ tagname: 1 });
module.exports = app => {
  const { mongoose } = app;
  return mongoose.model('TagUser', schema, 'naf_tag_user');
};
