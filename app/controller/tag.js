'use strict';

const Controller = require('egg').Controller;

class TagController extends Controller {
  constructor(ctx) {
    super(ctx);
    this.service = this.ctx.service.tag;
  }

  async index() {
    this.ctx.body = 'hi, user!';
  }

  async create() {
    const { ctx } = this;
    const { tagid, tagname } = ctx.request.body;
    const res = await this.service.create(tagid, tagname);
    this.ctx.ok('created', { data: res });
  }

  // POST 更新标签名字
  async update() {
    const { tagid } = this.ctx.query;
    const res = await this.service.update(tagid, this.ctx.request.body);
    this.ctx.ok('updated', { data: res });
  }

  // GET 删除标签
  async delete() {
    const { tagid } = this.ctx.query;
    await this.service.delete(tagid);
    this.ctx.ok();
  }

  // 获取标签列表
  async list() {
    const res = await this.service.list();
    this.ctx.ok({ taglist: res });
  }

  // GET 获取标签成员
  async fetch() {
    const res = await this.service.fetchMembers(this.ctx.query);
    this.ctx.ok(res);
  }

  // POST 增加标签成员
  async addtagusers() {
    let { tagid } = this.ctx.query;
    if (!tagid) {
      ({ tagid } = this.ctx.body);
    }
    const { userlist, partylist } = this.ctx.request.body;
    await this.service.addtagusers(tagid, userlist, partylist);
    this.ctx.ok('updated');
  }

  // POST 删除标签成员
  async deltagusers() {
    let { tagid } = this.ctx.query;
    if (!tagid) {
      ({ tagid } = this.ctx.body);
    }
    const { userlist, partylist } = this.ctx.request.body;
    await this.service.deltagusers(tagid, userlist, partylist);
    this.ctx.ok('deleted');
  }
}

module.exports = TagController;
