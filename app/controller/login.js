'use strict';

const Controller = require('egg').Controller;

class LoginController extends Controller {
  constructor(ctx) {
    super(ctx);
    this.service = this.ctx.service.login;
  }

  // POST 使用帐号密码登录
  async login() {
    const { ctx } = this;
    const { username, password, qrcode } = ctx.request.body;
    const res = await this.service.loginJwt({ username, password, qrcode });
    ctx.logger.debug(`login result: ${JSON.stringify(res)}`);
    this.ctx.ok(res);
  }

  // POST 修改用户密码
  async passwd() {
    const { ctx } = this;
    await this.service.passwd(ctx.request.body);
    this.ctx.ok('updated');
  }

}

module.exports = LoginController;
