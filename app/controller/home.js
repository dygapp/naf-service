'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    this.ctx.body = 'hi, egg';
  }

  async info(...args) {

    this.ctx.body = { args };
  }

  async dataAction() {
    this.ctx.success({ message: 'hi, demo!' });
  }

}


module.exports = HomeController;
