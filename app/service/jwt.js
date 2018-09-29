'use strict';

const assert = require('assert');
const _ = require('lodash');
const { BusinessError, ErrorCode } = require('naf-core').Error;
const { NafService } = require('naf-framework-mongoose/lib/service');
const jwt = require('jsonwebtoken');

class JwtLoginService extends NafService {
  constructor(ctx) {
    super(ctx, 'naf_user_info');
    this.model = this.ctx.model.User;
    this.dept = this.ctx.service.dept;
    this.tag = this.ctx.service.tag;
  }

  async login({ username, password }) {
    // TODO:参数检查和默认参数处理
    assert(username);
    assert(password);

    // TODO:检查useridh和mobile
    const entity = await this.model.findOne({ userid: username }, '+passwd +role').exec();
    if (!entity) {
      throw new BusinessError(ErrorCode.DATA_NOT_EXIST, '用户不存在');
    }
    if (!entity.passwd || entity.passwd.secret !== password) {
      throw new BusinessError(ErrorCode.BAD_PASSWORD);
    }
    const tags = await this.tag.fetchUserTag(entity);
    const userinfo = _.pick(entity, [ 'userid', 'name', 'role' ]);
    userinfo.tags = tags;
    const { secret, expiresIn = '1h', subject = 'naf' } = this.config.jwt;
    const token = await jwt.sign(userinfo, secret, { expiresIn, issuer: this.tenant, subject });
    return { userinfo, token };
  }
}

module.exports = JwtLoginService;
