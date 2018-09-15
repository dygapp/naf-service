'use strict';

const Controller = require('egg').Controller;

class TagController extends Controller {
  async index() {
    this.ctx.body = 'hi, user!';
  }

  async create() {
    const { ctx } = this;
    const { tag: service } = ctx.service;
    const { tagid, tagname } = ctx.request.body;
    const res = await service.create(tagid, tagname);
    this.ctx.ok('created', { tagid: res.tagid });
  }

  // GET 获取标签成员
  async fetch() {
    const { tagid } = this.ctx.query;
    const res = await this.service.fetchUsers(tagid);
    this.ctx.ok(res);
  }

  // POST 更新标签名字
  async update() {
    const { tagid, tagname } = this.ctx.request.body;
    await this.service.update(tagid, tagname);
    this.ctx.ok('updated');
  }

  // GET 删除标签
  async delete() {
    const { tagid } = this.ctx.query;
    await this.service.delete(tagid);
    this.ctx.ok();
  }

  // POST 增加标签成员
  async addtagusers() {
    const { tagid, userlist, partylist } = this.ctx.request.body;
    await this.service.addtagusers(tagid, userlist, partylist);
    this.ctx.ok('updated');
  }

  // POST 删除标签成员
  async deltagusers() {
    const { tagid, userlist, partylist } = this.ctx.request.body;
    await this.service.deltagusers(tagid, userlist, partylist);
    this.ctx.ok('deleted');
  }

  // 获取标签列表
  async list() {
    const res = await this.service.list();
    this.ctx.ok({ taglist: res });
  }
}

module.exports = TagController;
