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
    const { unitid } = this.ctx.query;
    const res = await this.service.update(unitid, this.ctx.request.body);
    this.ctx.ok('updated', { data: res });
  }

  // GET 删除单位
  async delete() {
    const { unitid } = this.ctx.query;
    await this.service.delete(unitid);
    this.ctx.ok();
  }

  // 获取单位列表
  async list() {
    const res = await this.service.list();
    this.ctx.ok({ data: res });
  }

  // GET 获取单位成员
  async fetch() {
    const { unitid } = this.ctx.query;
    const res = await this.service.fetchUsers(unitid);
    this.ctx.ok(res);
  }

  // POST 增加单位成员
  async createUser() {
    const { unitid } = this.ctx.query;
    const res = await this.service.createUser(unitid, this.ctx.request.body);
    this.ctx.ok('created', { data: res });
  }

  // GET 删除单位成员
  async deleteUser() {
    const { unitid, userid } = this.ctx.query;
    await this.service.deltagusers(unitid, userid);
    this.ctx.ok('deleted');
  }

  // POST 修改单位成员
  async updateUser() {
    const res = await this.service.updateUser(this.ctx.query, this.ctx.request.body);
    this.ctx.ok('updated', { data: res });
  }
}

module.exports = UnitController;
