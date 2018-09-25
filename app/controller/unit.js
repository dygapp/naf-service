'use strict';

const Controller = require('egg').Controller;

class UnitController extends Controller {
  constructor(ctx) {
    super(ctx);
    this.service = this.ctx.service.unit;
  }

  async create() {
    const { ctx } = this;
    const res = await this.service.create(ctx.request.body);
    this.ctx.ok('created', { data: res });
  }

  // POST 更新单位名字
  async update() {
    const { code } = this.ctx.query;
    const res = await this.service.update(code, this.ctx.request.body);
    this.ctx.ok('updated', { data: res });
  }

  // GET 删除单位
  async delete() {
    const { code } = this.ctx.query;
    await this.service.delete(code);
    this.ctx.ok();
  }

  // 获取单位列表
  async list() {
    const res = await this.service.list();
    this.ctx.ok({ data: res });
  }

  async fetch() {
    const { code } = this.ctx.query;
    const res = await this.service.fetch(code);
    this.ctx.ok({ data: res });
  }

  // GET 获取单位成员
  async fetchUsers() {
    const { unitcode } = this.ctx.query;
    const res = await this.service.fetchUsers(unitcode);
    this.ctx.ok({ data: res });
  }

  // POST 增加单位成员
  async createUser() {
    const { unitcode } = this.ctx.query;
    const res = await this.service.createUser(unitcode, this.ctx.request.body);
    this.ctx.ok('created', { data: res });
  }

  // GET 删除单位成员
  async deleteUser() {
    await this.service.deleteUser(this.ctx.query);
    this.ctx.ok('deleted');
  }

  // POST 修改单位成员
  async updateUser() {
    const res = await this.service.updateUser(this.ctx.query, this.ctx.request.body);
    this.ctx.ok('updated', { data: res });
  }

  // POST 修改单位成员密码
  async passwd() {
    await this.service.passwd(this.ctx.query, this.ctx.request.body);
    this.ctx.ok('updated');
  }
}

module.exports = UnitController;
