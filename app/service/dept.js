'use strict';

const assert = require('assert');
const util = require('core-util-is');
const { BusinessError, ErrorCode } = require('naf-core').Error;
const NafService = require('./base');

class DepartmentService extends NafService {
  constructor(ctx) {
    super(ctx, 'naf_user_dept');
    this.model = ctx.model.Dept;
    this.nUser = ctx.model.User;
  }

  async create(id, name, parentid = 0, order = 0) {
    // TODO:参数检查和默认参数处理
    assert(name);
    id = id || await this.nextId();

    // TODO:保存数据
    const res = await this._create({ id, name, parentid, order });
    return res;
  }

  async update(id, update) {
    assert(id);
    const { name, parentid, order } = update;
    // TODO:检查数据是否存在
    const entity = await this._findOne({ id });
    if (util.isNullOrUndefined(entity)) throw new BusinessError(ErrorCode.DATA_NOT_EXIST);

    // TODO: 修改数据
    entity.set({ name, parentid, order });
    await entity.save();
  }

  async delete(id) {
    assert(id);

    // TODO: 检查是否包含子部门
    let count = await this._count({ parentid: id, tenant: this.tenant });
    if (count > 0) {
      throw new BusinessError(60006, '部门下存在子部门');
    }
    // TODO: 检查是否包含成员
    count = await this._count({ department: { $elemMatch: { $eq: id } } }, this.mUser);
    if (count > 0) {
      throw new BusinessError(60005, '部门下存在成员');
    }

    await this._remove({ id });
  }

  async list(id = 0) {
    let rs = [];
    if (id > 0) {
      rs = await this._find({ id });
    }
    const children = await this.findChildren(id);
    if (rs && rs.size > 0) {
      rs = [ ...rs, ...children ];
    }
    return rs;
  }

  // 递归获取子部门信息
  async findChildren(parentid = 0) {
    let rs = [];
    const findChildren = this.findChildren;
    rs = await this._find({ parentid });
    if (rs && rs.size > 0) {
      await rs.map(async p => {
        const children = await findChildren(p.id);
        return [ p, ...children ];
      });
    }
    return rs;
  }
}

module.exports = DepartmentService;
