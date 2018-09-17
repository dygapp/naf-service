'use strict';

const assert = require('assert');
const _ = require('lodash');
const { NafService } = require('naf-framework-mongoose/lib/service');
const { BusinessError, ErrorCode } = require('naf-core').Error;

const UNIT_PROJECTION = 'unitid unitname';
const UNIT_PICKS = UNIT_PROJECTION.split(' ');

class UnitService extends NafService {
  constructor(ctx) {
    super(ctx, 'naf_unit');
    this.model = this.ctx.model.Unit;
  }

  async create({ unitid, unitname }) {
    assert(unitname && unitid);

    // TODO:检查unitid和unitname
    const count = await this.model.countDocuments({ $or: [{ unitid }, { unitname }] }).exec();
    if (count > 0) {
      throw new BusinessError(ErrorCode.DATA_EXISTED, '单位已存在', 'unitid或unitname已经存在');
    }

    const res = await this.model.create({ unitid, unitname });
    return _.pick(res, UNIT_PICKS);
  }

  async update(unitid, { unitid: _unitid, unitname }) {
    assert(unitid || _unitid);
    assert(unitname);
    if (!unitid) unitid = _unitid;

    // TODO:检查unitname是否重复
    const count = await this.model.countDocuments({ unitid: { $ne: unitid }, unitname }).exec();
    if (count > 0) {
      throw new BusinessError(ErrorCode.DATA_EXISTED, '单位名与其他单位重复');
    }

    const res = await this.model.findOneAndUpdate({ unitid }, { unitname }, { new: true }).exec();
    return _.pick(res, UNIT_PICKS);
  }

  async delete(unitid) {
    assert(unitid);
    await this.model.deleteOne({ unitid }).exec();
  }

  // 获得标签列表
  async list() {
    return await this.model.find({}, UNIT_PROJECTION).exec();
  }

  // 获取单位管理员
  async fetchUsers(unitid) {
    assert(unitid);
    const entity = await this.model.findOne({ unitid }).exec();
    if (!entity) throw new BusinessError(ErrorCode.DATA_NOT_EXIST);
  }

  // 创建单位默认管理员
  async createUser(unitid, data) {
    assert(unitid);
    assert(data);
  }

  // 将用户或部门从标签删除
  async deleteUser(unitid, userid) {
    assert(unitid);
    assert(userid);
  }

  // 修改单位默认管理员
  async updateUser({ unitid, userid }, update) {
    assert(unitid && userid);
    assert(update);
  }
}

module.exports = UnitService;
