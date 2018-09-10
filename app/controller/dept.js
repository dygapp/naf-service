'use strict';

const Controller = require('egg').Controller;

class DepartmentController extends Controller {
  constructor(ctx) {
    super(ctx);
    // const DepartmentService = require('../../service/dept');
    // this.service = new DepartmentService(this.ctx);
    this.service = this.ctx.service.dept;
  }

  // POST
  async create() {
    const { name, id, parentid, order } = this.ctx.request.body;
    const res = await this.service.create(id, name, parentid, order);
    this.ctx.ok('created', { data: res });
  }

  // POST
  async update() {
    this.ctx.logger.debug(`reuqest /detp/update: ${this.ctx.query}`);
    const { id } = this.ctx.query;
    const { name, id: _id, parentid, order } = this.ctx.request.body;
    const res = await this.service.update(id || _id, { name, parentid, order });
    this.ctx.ok('updated', { data: res });
  }

  // GET
  async delete() {
    const { id } = this.ctx.query;
    await this.service.delete(id);
    this.ctx.ok('deleted');
  }

  // GET
  async list() {
    const { id, parentid, recursive } = this.ctx.query;
    const list = await this.service.list(id, parentid, recursive);
    this.ctx.body = { errcode: 0, errmsg: 'ok', data: list };
  }
}

module.exports = DepartmentController;
