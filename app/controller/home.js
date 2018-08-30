'use strict';

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

  async create() {
    const { Demo } = this.ctx.tmodel;
    const { key, val } = this.ctx.query;
    let doc = await Demo.create({ key, val });
    doc = await doc.save();
    this.ctx.success({ data: doc });
  }

  async list() {
    // console.log('ctx.tenant: ', this.ctx.tenant);
    const { Demo } = this.ctx.tmodel;
    const rs = await Demo.find({}).exec();
    this.ctx.success({ data: rs });
    // console.log('model.Demo: ', Demo);
  }
}


module.exports = HomeController;
