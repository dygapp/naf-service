'use strict';

const assert = require('assert');
const _ = require('lodash');
const { isNullOrUndefined, toBoolean, trimData } = require('naf-core').Util;
const { BusinessError, ErrorCode } = require('naf-core').Error;
const { NafService } = require('naf-framework-mongoose/lib/service');

class DepartmentService extends NafService {
  constructor(ctx) {
    super(ctx, 'naf_user_dept');
    this.model = this.ctx.model.Dept;
    this.mUser = this.ctx.model.User;
  }
  async nextId() {
    const rs = await this.model.find()
      .sort({ id: -1 })
      .limit(1)
      .exec();
    return (rs && rs[0] && rs[0].id + 1) || 1;
  }

  async create(id, name, parentid = 0, order = 0) {
    // TODO:参数检查和默认参数处理
    assert(name);

    if (id && id < 0) {
      throw new BusinessError(ErrorCode.BADPARAM, 'ID必须大于0');
    }

    // TODO: 检查是否存在
    if (id) {
      const entity = await this.model.findOne({ id }).exec();
      if (entity) throw new BusinessError(ErrorCode.DATA_EXISTED);
    }

    id = id || await this.nextId();

    // TODO: 检查上级部门是否存在
    let path = [];
    if (parentid) {
      const entity = await this.model.findOne({ id: parentid }).exec();
      if (isNullOrUndefined(entity)) throw new BusinessError(ErrorCode.DATA_NOT_EXIST, '上级部门不存在');
      path = entity.path || [];
    }
    path = path.concat(id);

    // TODO:保存数据
    const res = await this.model.create({ id, name, parentid, path, order });
    return res;
  }

  async update(id, update) {
    assert(id);
    const { name, parentid, order } = update;
    // TODO:检查数据是否存在
    const entity = await this.model.findOne({ id }).exec();
    if (isNullOrUndefined(entity)) throw new BusinessError(ErrorCode.DATA_NOT_EXIST);

    let path;
    // TODO: 检查是否包含子部门
    if (_.isNumber(parentid) && parentid !== entity.parentid) {
      const count = await this.model.countDocuments({ parentid: id }).exec();
      if (count > 0) {
        throw new BusinessError(60006, '部门下存在子部门');
      }
      // TODO: 检查上级部门是否存在
      const parent = await this.model.findOne({ id: parentid }).exec();
      if (isNullOrUndefined(parent)) throw new BusinessError(ErrorCode.DATA_NOT_EXIST, '上级部门不存在');
      path = parent.path || [];
      path = path.concat(entity.id);
    }

    // TODO: 修改数据
    entity.set(trimData({ name, parentid, path, order }));

    return await entity.save();
  }

  async delete(id) {
    assert(id);

    // TODO: 检查是否包含子部门
    let count = await this.model.countDocuments({ parentid: id }).exec();
    if (count > 0) {
      throw new BusinessError(60006, '部门下存在子部门');
    }
    // TODO: 检查是否包含成员
    count = await this.mUser.countDocuments({ department: { $elemMatch: { $eq: id } } }).exec();
    if (count > 0) {
      throw new BusinessError(60005, '部门下存在成员');
    }

    await this.model.deleteOne({ id }).exec();
  }

  async list(id = 0, parentid = 0, recursive = false) {
    let rs = [];
    if (id > 0) {
      rs = await this.model.find({ id }).exec();
    }
    const children = await this.findChildren(id || parentid, toBoolean(recursive));
    if (rs && rs.length > 0) {
      rs = [ ...rs, ...children ];
    } else {
      rs = children;
    }

    return rs;
  }

  // 递归获取子部门信息
  async findChildren(parentid = 0, recursive) {
    let rs = [];
    rs = await this.model.find({ parentid }).exec();
    if (recursive && rs && rs.length > 0) {
      for (let i = 0; i < rs.length; i++) {
        const children = await this.findChildren(rs[i].id, recursive);
        if (children && children.length > 0) rs = [ ...rs, ...children ];
      }
    }
    return rs;
  }

}

module.exports = DepartmentService;
