'use strict';
/**
 * 用户账号（多租户）
 */
const { RequiredString, NullableString, Secret } = require('naf-framework-mongoose/lib/model/schema');
const Schema = require('mongoose').Schema;

// 绑定账号
const accountSchema = new Schema({
  // 帐号类型：qq、weixin、email、mobile、weibo等
  type: { type: String, required: true, maxLength: 64 },
  // 账号绑定ID
  account: { type: String, required: true, maxLength: 128 },
  // 绑定状态: 0-未验证、1-已绑定、2-解除绑定
  bind: { type: String, required: true, maxLength: 64, default: '0' },
}, { timestamps: true });
accountSchema.index({ type: 1, account: 1 });

const SchemaDefine = {
  userid: RequiredString(64),
  name: RequiredString(64),
  gender: NullableString(64),
  mobile: NullableString(64),
  telephone: NullableString(64),
  email: NullableString(128),
  position: NullableString(64),
  status: { type: String, maxLength: 64, default: '0' },
  department: [ Number ],
  order: [ Number ],
  attrs: Object,
  passwd: {
    type: Secret,
    select: false,
  },
  // 绑定微信信息
  weixin: {
    type: accountSchema,
    select: false,
  },
  // 用户角色
  role: {
    type: String,
    enum: [ 'super', 'admin', 'user' ],
    default: 'user',
    lowercase: true,
    select: false,
  },
  origin: String, // 用户来源
};
const schema = new Schema(SchemaDefine, { timestamps: true, 'multi-tenancy': true });

module.exports = app => {
  const { mongoose } = app;
  return mongoose.model('User', schema, 'naf_user_info');
};
