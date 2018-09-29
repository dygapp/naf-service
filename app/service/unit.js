'use strict';

const assert = require('assert');
const _ = require('lodash');
const { NafService } = require('naf-framework-mongoose/lib/service');
const { BusinessError, ErrorCode } = require('naf-core').Error;

const UNIT_PROJECTION = 'code name';
const UNIT_PICKS = UNIT_PROJECTION.split(' ');

class UnitService extends NafService {
  constructor(ctx) {
    super(ctx, 'naf_unit');
    this.model = this.ctx.model.Unit;
  }

  async create({ code, name, createUser = false }) {
    assert(name && code);

    // TODO:检查unitid和unitname
    const count = await this.model.countDocuments({ $or: [{ code }, { name }] }).exec();
    if (count > 0) {
      throw new BusinessError(ErrorCode.DATA_EXISTED, '单位已存在', 'unitid或unitname已经存在');
    }

    let res = await this.model.create({ code, name });
    res = _.pick(res, UNIT_PICKS);

    // TODO: 创建默认用户
    if (createUser) {
      try {
        await this.createUser(code, { userid: 'admin', name: '默认管理员' });
      } catch (err) {
        this.logger.warn('创建默认管理员失败!', err);
      }
    }
    return res;
  }

  async update(code, { code: _code, name }) {
    assert(code || _code);
    assert(name);
    if (!code) code = _code;

    // TODO:检查unitname是否重复
    const count = await this.model.countDocuments({ code: { $ne: code }, name }).exec();
    if (count > 0) {
      throw new BusinessError(ErrorCode.DATA_EXISTED, '单位名与其他单位重复');
    }

    const res = await this.model.findOneAndUpdate({ code }, { name }, { new: true }).exec();
    return _.pick(res, UNIT_PICKS);
  }

  async delete(code) {
    assert(code);
    await this.model.deleteOne({ code }).exec();
  }

  // 获得列表
  async list() {
    return await this.model.find({}, UNIT_PROJECTION).exec();
  }

  async fetch(code) {
    return await this.model.findOne({ code }, UNIT_PROJECTION).exec();
  }

  // 获取单位管理员
  async fetchUsers(unitcode) {
    assert(unitcode);
    const model = await this.userModel(unitcode);
    return model.find({ origin: 'master' }).exec();
  }

  // 创建单位默认管理员
  async createUser(unitcode, data) {
    assert(unitcode);
    assert(data);
    const model = await this.userModel(unitcode);
    const { userid, name, mobile, department = [ 0 ], order = [ 0 ], position, gender, email, telephone, attrs, status } = data;
    // TODO:参数检查和默认参数处理
    assert(userid);
    assert(name);

    // TODO:检查useridh和mobile
    const count = await model.countDocuments({ userid }).exec();
    if (count > 0) {
      throw new BusinessError(ErrorCode.DATA_EXISTED, '帐号已存在');
    }

    // TODO:保存数据
    const res = await model.create({ role: 'super', userid, name, mobile, department, order, position, gender, email, telephone, attrs, status, origin: 'master' });
    return res;
  }

  // 删除用户
  async deleteUser({ unitcode, userid }) {
    assert(userid);
    const model = await this.userModel(unitcode);
    model.deleteOne({ userid });
  }

  // 修改单位默认管理员
  async updateUser({ unitcode, userid }, update) {
    assert(userid);
    assert(update);
    const model = await this.userModel(unitcode);

    // TODO:提取可修改的字段
    const { name, department, order, position, gender, email, telephone, attrs, status } = update;

    // TODO:保存数据
    const entity = await model.findOneAndUpdate({ userid },
      { name, department, order, position, gender, email, telephone, attrs, status },
      { new: true }).exec();
    return entity;
  }

  async passwd({ unitcode, userid }, update) {
    assert(userid);
    assert(update);
    if (_.isString(update)) update = { newpass: update };
    const { newpass } = update;

    const model = await this.userModel(unitcode);
    const entity = await model.findOne({ userid }).exec();
    if (!entity) throw new BusinessError(ErrorCode.DATA_NOT_EXIST, '用户不存在');
    if (entity.passwd) {
      entity.passwd.secret = newpass;
    } else {
      entity.passwd = { secret: newpass };
    }
    await entity.save();
  }

  async userModel(unitcode) {
    assert(unitcode);
    const unit = await this.model.findOne({ code: unitcode }).exec();
    if (!unit) {
      throw new BusinessError(ErrorCode.DATA_NOT_EXIST, '单位不存在');
    }
    const model = this.app.tenantModel(unit.code).User;
    return model;
  }
}

module.exports = UnitService;
