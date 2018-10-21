'use strict';

const Controller = require('egg').Controller;

class LoginController extends Controller {
  constructor(ctx) {
    super(ctx);
    this.service = this.ctx.service.login;
  }

  // GET 通过微信号获得用户信息
  async fetch() {
    const { openid } = this.ctx.requestparam;
    console.log('openid: ', openid);
    const res = await this.service.fetchByWeixin(openid);
    this.ctx.ok({ userinfo: res });
  }

  // POST 绑定用户微信号
  async bind() {
    const { qrcode, openid, username, password } = this.ctx.requestparam;
    await this.service.bind({ qrcode, openid, username, password });
    this.ctx.ok();
  }

  // POST 解除绑定用户微信号
  async unbind() {
    await this.service.unbind(this.ctx.request.body);
    this.ctx.ok();
  }

  // POST 生成二维码
  async qrcode() {
    const res = await this.service.createQrcode();
    this.ctx.ok({ data: res });
  }

  // POST 检查二维码
  async check() {
    const { qrcode } = this.ctx.requestparam;
    const res = await this.service.checkQrcode(qrcode);
    this.ctx.ok(res);
  }

  // POST 微信扫码登录
  async login() {
    const { openid, qrcode } = this.ctx.requestparam;
    await this.service.scanQrcode({ qrcode, openid });
    this.ctx.ok();
  }

}

module.exports = LoginController;
