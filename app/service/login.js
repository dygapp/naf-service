'use strict';

const assert = require('assert');
const _ = require('lodash');
const uuid = require('uuid');
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

  // 验证用户名密码，返回用户信息
  async checkPass({ username, password }) {
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
    return entity;
  }

  async loginSample({ username, password }) {
    const userinfo = await this.checkPass({ username, password });
    return _.omit(userinfo, 'passwd');
  }

  // 使用（用户名+密码）、openid或qrcode登录, 返回JWT信息
  async loginJwt({ username, password, openid, qrcode }) {
    if (qrcode) {
      return await this.qrcodeLogin(qrcode);
    } else if (openid) {
      const userinfo = await this.fetchByWeixin(openid);
      username = userinfo.userid;
    } else {
      await this.checkPass({ username, password });
    }
    return await this.createJwt(username);
  }

  // 创建指定用户的登录凭证
  async createJwt(userid) {
    // TODO:参数检查和默认参数处理
    assert(userid, '用户名不能为空');

    // TODO:检查用户
    const entity = await this.model.findOne({ userid }, '+role').exec();
    if (!entity) {
      throw new BusinessError(ErrorCode.DATA_NOT_EXIST, '用户不存在');
    }
    const tags = await this.tag.fetchUserTag(entity);
    const userinfo = _.pick(entity, [ 'userid', 'name', 'role' ]);
    userinfo.tags = tags;
    const { secret, expiresIn = '1h', subject = 'naf' } = this.config.jwt;
    const token = await jwt.sign(userinfo, secret, { expiresIn, issuer: this.tenant, subject });
    return { userinfo, token };
  }

  // 修改密码
  async passwd({ username, oldpass, newpass }) {
    assert(username, '用户名不能为空');
    assert(oldpass, '原有密码不能为空');
    assert(newpass, '新密码不能为空');

    // 检查用户是否存在
    const entity = await this.model.findOne({ userid: username }, '+passwd +role').exec();
    if (!entity) throw new BusinessError(ErrorCode.DATA_NOT_EXIST, '用户不存在');
    // 校验旧密码
    if (!entity.passwd || entity.passwd.secret !== oldpass) {
      throw new BusinessError(ErrorCode.BAD_PASSWORD);
    }
    if (entity.passwd) {
      entity.passwd.secret = newpass;
    } else {
      entity.passwd = { secret: newpass };
    }
    await entity.save();
  }

  // 通过微信获得用户信息
  async fetchByWeixin(openid) {
    assert(openid, '微信ID不能为空');

    // TODO:检查用户信息
    const entity = await this.model.findOne({ 'weixin.account': openid }, '+weixin').exec();
    if (!entity) {
      throw new BusinessError(ErrorCode.USER_NOT_BIND, '该微信号未绑定用户');
    }

    return entity;
  }

  /**
   * 创建二维码
   * 随机生成二维码，并保存在Redis中，状态初始为pending
   * 状态描述：
   * pending - 等待扫码
   * consumed - 使用二维码登录完成
   * ${jwt.token} - Jwt登录凭证
   */
  async createQrcode() {
    const qrcode = uuid();
    const key = `smart:qrcode:login:${qrcode}`;
    await this.app.redis.set(key, 'pending', 'EX', 600);
    return qrcode;
  }

  /**
   * 扫码登录确认
   */
  async scanQrcode({ qrcode, openid }) {
    assert(qrcode, 'qrcode不能为空');
    assert(openid, 'openid不能为空');
    const key = `smart:qrcode:login:${qrcode}`;
    const status = await this.app.redis.get(key);
    if (!status) {
      throw new BusinessError(ErrorCode.SERVICE_FAULT, '二维码已过期');
    }
    if (status !== 'pending') {
      throw new BusinessError(ErrorCode.SERVICE_FAULT, '二维码状态无效');
    }

    // 使用微信登录
    const jwt = await this.loginJwt({ openid });

    // TODO: 修改二维码状态，登录凭证保存到redis
    await this.app.redis.set(key, `scaned:${jwt.token}`, 'EX', 600);

    // TODO: 发布扫码成功消息
    const { mq } = this.ctx;
    const ex = 'qrcode.login';
    if (mq) {
      await mq.topic(ex, qrcode, 'scaned', { durable: true });
    }
  }

  // 使用二维码换取登录凭证
  async qrcodeLogin(qrcode) {
    assert(qrcode, 'qrcode不能为空');
    const key = `smart:qrcode:login:${qrcode}`;
    const val = await this.app.redis.get(key);
    if (!val) {
      throw new BusinessError(ErrorCode.SERVICE_FAULT, '二维码已过期');
    }
    const [ status, token ] = val.split(':', 2);
    if (status !== 'scaned' || !token) {
      throw new BusinessError(ErrorCode.SERVICE_FAULT, '二维码状态无效');
    }

    // TODO: 修改二维码状态
    await this.app.redis.set(key, 'consumed', 'EX', 600);

    return { token };
  }

  // 检查二维码状态
  async checkQrcode(qrcode) {
    assert(qrcode, 'qrcode不能为空');
    const key = `smart:qrcode:login:${qrcode}`;
    const val = await this.app.redis.get(key);
    if (!val) {
      throw new BusinessError(ErrorCode.SERVICE_FAULT, '二维码已过期');
    }
    const [ status ] = val.split(':', 2);
    return { status };
  }

  // 绑定用户微信号
  async bind({ username, password, openid, qrcode }) {
    // TODO:参数检查和默认参数处理
    assert(username, '用户名不能为空');
    assert(password, '密码不能为空');
    assert(openid, '微信ID不能为空');

    // TODO: 检查用户密码
    const entity = await this.checkPass({ username, password });
    // TODO: 执行绑定逻辑
    await this.ctx.service.user.bind({ _id: entity._id, openid });
    // TODO: 执行登录逻辑
    await this.scanQrcode({ qrcode, openid });
  }

  // 按照微信ID解除微信绑定
  async unbind(openid) {
    // TODO:参数检查和默认参数处理
    assert(openid, '微信ID不能为空');

    // TODO: 执行绑定逻辑
    await this.ctx.service.user.unbind({ openid });
  }
}

module.exports = JwtLoginService;
