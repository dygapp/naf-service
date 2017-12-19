'use strict';

const assert = require('assert');
const is = require('is-type-of');
const NafService = require('./base');
const { BusinessError, ErrorCode } = require('naf-core').Error;

class TagService extends NafService {
  constructor(ctx) {
    super(ctx, 'naf_user_tag');
    this.model = ctx.model.Tag;
    this.user = ctx.service.user;
    this.dept = ctx.service.dept;
  }

  async create(tagid, tagname) {
    assert(tagname);
    tagid = tagid || await this.nextId();
    const res = await this._create({ tagid, tagname });
    return res;
  }

  async update(tagid, tagname) {
    assert(tagid);
    const res = await this._findOneAndUpdate({ tagid }, { tagname });
    return res;
  }

  async delete(tagid) {
    assert(tagid);
    await this._remove({ tagid });
  }

  // 获取标签成员
  async fetchUsers(tagid) {
    assert(tagid);
    const entity = await this._findOne({ tagid });
    if (!entity) throw new BusinessError(ErrorCode.DATA_NOT_EXIST);
    const userlist = await this.user._find({ userid: { $in: entity.userlist } }, 'userid name');
    return { tagname: entity.tagname, userlist, partylist: entity.partylist };
  }

  // 将用户或部门添加到标签
  async addtagusers(tagid, userlist = [], partylist = []) {
    assert(tagid);
    assert(is.array(userlist));
    assert(is.array(partylist));
    return await this.model.findOneAndUpdate({ tagid, tenant: this.tenant }, { $push: {
      userlist: { $each: userlist },
      partylist: { $each: partylist },
    } });
  }

  // 将用户或部门从标签删除
  async deltagusers(tagid, userlist = [], partylist = []) {
    assert(tagid);
    assert(is.array(userlist));
    assert(is.array(partylist));
    return await this.model.findOneAndUpdate({ tagid, tenant: this.tenant }, { $pull: {
      userlist: { $in: userlist },
      partylist: { $in: partylist },
    } });
  }

  // 获得标签列表
  async list() {
    return await this._find({}, 'tagid tagname');
  }
}

module.exports = TagService;
