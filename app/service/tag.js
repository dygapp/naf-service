'use strict';

const assert = require('assert');
const is = require('is-type-of');
const { NafService } = require('naf-framework-mongoose/lib/service');
const { BusinessError, ErrorCode } = require('naf-core').Error;

class TagService extends NafService {
  constructor(ctx) {
    super(ctx, 'naf_user_tag');
    this.model = this.ctx.model.Tag;
    this.mUser = this.ctx.model.User;
  }

  async create(tagid, tagname) {
    assert(tagname);
    tagid = tagid || await this.nextId();
    const res = await this.model.create({ tagid, tagname });
    return res;
  }

  async update(tagid, tagname) {
    assert(tagid);
    const res = await this.model.findOneAndUpdate({ tagid }, { tagname }).exec();
    return res;
  }

  async delete(tagid) {
    assert(tagid);
    await this.model.remove({ tagid }).exec();
  }

  // 获取标签成员
  async fetchUsers(tagid) {
    assert(tagid);
    const entity = await this.model.findOne({ tagid }).exec();
    if (!entity) throw new BusinessError(ErrorCode.DATA_NOT_EXIST);
    const userlist = await this.mUser.find({ userid: { $in: entity.userlist } }, 'userid name').exec();
    return { tagname: entity.tagname, userlist, partylist: entity.partylist };
  }

  // 将用户或部门添加到标签
  async addtagusers(tagid, userlist = [], partylist = []) {
    assert(tagid);
    assert(is.array(userlist));
    assert(is.array(partylist));
    return await this.model.findOneAndUpdate({ tagid }, { $push: {
      userlist: { $each: userlist },
      partylist: { $each: partylist },
    } }).exec();
  }

  // 将用户或部门从标签删除
  async deltagusers(tagid, userlist = [], partylist = []) {
    assert(tagid);
    assert(is.array(userlist));
    assert(is.array(partylist));
    return await this.model.findOneAndUpdate({ tagid }, { $pull: {
      userlist: { $in: userlist },
      partylist: { $in: partylist },
    } }).exec();
  }

  // 获得标签列表
  async list() {
    return await this.model.find({}, 'tagid tagname').exec();
  }
}

module.exports = TagService;
