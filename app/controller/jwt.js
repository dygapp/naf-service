'use strict';

const Controller = require('egg').Controller;

class JwtController extends Controller {
  constructor(ctx) {
    super(ctx);
    this.service = this.ctx.service.jwt;
  }

  // POST 创建成员
  async login() {
    const { ctx } = this;
    const res = await this.service.login(ctx.request.body);
    ctx.logger.debug(`login result: ${JSON.stringify(res)}`);
    this.ctx.ok(res);
  }
}

module.exports = JwtController;
