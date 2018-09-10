'use strict';

// FOR egg extend types define
require('naf-framework-mongoose');

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    this.ctx.body = 'hi, egg';
    console.log('ctx.tenant: ', this.ctx.tenant);
  }

  async info(...args) {
    this.ctx.body = { args };
  }

  async echoAction() {
    this.ok({ requestparam: this.ctx.requestparam });
  }

  async dataAction() {
    this.ctx.success({ message: 'hi, demo!' });
  }

}


module.exports = HomeController;
