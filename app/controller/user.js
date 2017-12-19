'use strict';

const Controller = require('egg').Controller;


class UserController extends Controller {
  constructor(ctx) {
    super(ctx);
    // const UserService = require('../../service/user');
    // this.service = new UserService(ctx);
    this.service = this.ctx.service.user;
  }

  // POST 创建成员
  async create() {
    const { ctx } = this;
    const res = await this.service.create(ctx.request.body);
    ctx.logger.debug(`create result: ${res}`);
    this.ok('created');
  }

  // GET 读取成员
  async fetch() {
    const { ctx } = this;
    const { userid } = ctx.query;
    const res = await this.service.fetch(userid);
    this.ok(res);
  }

  // POST 更新成员
  async update() {
    const { ctx } = this;
    const { userid } = ctx.request.body;
    const res = await this.service.update(userid, ctx.request.body);
    ctx.logger.debug(`update result: ${res}`);
    this.ok('updated');
  }

  // GET 删除成员
  async delete() {
    const { ctx } = this;
    const { userid } = ctx.query;
    const res = await this.service.delete(userid);
    ctx.logger.debug(`delete result: ${res}`);
    this.ok('deleted');
  }

  // POST 批量删除成员
  async batchdelete() {
    const { ctx } = this;
    const { useridlist } = this.ctx.request.body;
    const res = await this.service.batchdelete(useridlist);
    ctx.logger.debug(`batch delete result: ${res}`);
    this.ok('deleted');
  }

  // GET 获取部门成员
  async simplelist() {
    const { department_id, fetch_child } = this.ctx.query;
    const res = await this.service.list(department_id, fetch_child, 1);
    this.ok({ userlist: res });
  }

  // GET 获取部门成员详情
  async list() {
    const { department_id, fetch_child } = this.ctx.query;
    const res = await this.service.list(department_id, fetch_child, 0);
    this.ok({ userlist: res });
  }

  // POST
  async passwd() {
    const { ctx } = this;
    const { userid, newpass } = ctx.request.body;
    ctx.body = await this.service.passwd(userid, newpass);
  }
}

module.exports = UserController;
