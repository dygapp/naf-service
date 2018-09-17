'use strict';

const assert = require('assert');
const _ = require('lodash');
const { BusinessError, ErrorCode } = require('naf-core').Error;
const { NafService } = require('naf-framework-mongoose/lib/service');

const INFO_FULL = 'userid name mobile department order position gender email telephone attrs status';
const INFO_SIMPLE = 'userid name';

class UserinfoService extends NafService {
  constructor(ctx) {
    super(ctx, 'naf_user_info');
    this.model = this.ctx.model.User;
    this.dept = this.ctx.service.dept;
  }

  async create(data) {
    const { userid, name, mobile, department = [ 0 ], order = [ 0 ], position, gender, email, telephone, attrs, status } = data;
    // TODO:参数检查和默认参数处理
    assert(userid);
    assert(name);

    // TODO:检查useridh和mobile
    const count = await this.model.countDocuments({ userid }).exec();
    if (count > 0) {
      throw new BusinessError(ErrorCode.DATA_EXISTED, '用户帐号已存在');
    }
    // count = await this.model.countDocuments({ mobile }).exec();
    // if (count > 0) {
    //   throw new BusinessError(ErrorCode.DATA_EXISTED, '手机号已存在');
    // }

    // TODO:保存数据
    const res = await this.model.create({ userid, name, mobile, department, order, position, gender, email, telephone, attrs, status });
    return res;
  }

  async fetch(userid) {
    const res = await this.model.findOne({ userid }, INFO_FULL).exec();
    return res;
  }

  async update(userid, update) {
    // TODO:参数检查和默认参数处理
    assert(update);
    assert(userid || update.userid);
    if (!userid) userid = update.userid;

    // TODO:提取可修改的字段
    const { name, department, order, position, gender, email, telephone, attrs, status } = update;

    // TODO:保存数据
    const entity = await this.model.findOneAndUpdate({ userid },
      { name, department, order, position, gender, email, telephone, attrs, status },
      { new: true }).exec();
    return entity;
  }

  async batchdelete(useridlist) {
    await this.model.deleteMany({ userid: { $in: useridlist } }).exec();
  }

  async delete(userid) {
    if (userid === 'admin') {
      throw new BusinessError(ErrorCode.SERVICE_FAULT, '系统管理员不能删除');
    }
    await this.model.deleteOne({ userid }).exec();
  }

  async list(department_id = 0, fetch_child = 0, simple = 1) {
    let depts = [ department_id ];
    if (fetch_child) {
      let rs = await this.dept.findChildren(department_id);
      rs = rs.map(p => p.id);
      depts = depts.concat(...rs);
    }
    const res = await this.model.where({ department: { $elemMatch: { $in: depts } } })
      .select(simple ? INFO_SIMPLE : INFO_FULL)
      .exec();
    return res;
  }

  async passwd(userid, update) {
    assert(userid);
    assert(update);
    if (_.isString(update)) update = { newpass: update };
    const { newpass } = update;

    const entity = await this.model.findOne({ userid }).exec();
    if (!entity) throw new BusinessError(ErrorCode.DATA_NOT_EXIST, '用户不存在');
    if (entity.passwd) {
      entity.passwd.secret = newpass;
    } else {
      entity.passwd = { secret: newpass };
    }
    await entity.save();

    // await this.model.update({ userid }, { $set: { passwd: { mech: 'plain', secret: newpass } } }, { new: true }).exec();
  }

  async login({ username, password }) {
    // TODO:参数检查和默认参数处理
    assert(username);
    assert(password);

    // TODO:检查useridh和mobile
    const entity = await this.model.findOne({ userid: username }).exec();
    if (!entity) {
      throw new BusinessError(ErrorCode.DATA_NOT_EXIST, '用户不存在');
    }
    if (!entity.passwd || entity.passwd.secret !== password) {
      throw new BusinessError(ErrorCode.BAD_PASSWORD);
    }
    return _.pick(entity, INFO_FULL.split(' '));
  }
}

module.exports = UserinfoService;
