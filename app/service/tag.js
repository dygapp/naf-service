'use strict';

const assert = require('assert');
const _ = require('lodash');
const { NafService } = require('naf-framework-mongoose/lib/service');
const { BusinessError, ErrorCode } = require('naf-core').Error;

const TAG_PROJECTION = 'tagid tagname';
const TAG_PICKS = TAG_PROJECTION.split(' ');

class TagService extends NafService {
  constructor(ctx) {
    super(ctx, 'naf_user_tag');
    this.model = this.ctx.model.Tag;
    this.mTagUser = this.ctx.model.TagUser;
    this.mUser = this.ctx.model.User;
  }

  async nextId() {
    const rs = await this.model.find()
      .sort({ tagid: -1 })
      .limit(1)
      .exec();
    return (rs && rs[0] && rs[0].tagid + 1) || 1;
  }

  async create(tagid, tagname) {
    assert(tagname);
    tagid = tagid || await this.nextId();

    // TODO:检查tagid和tagname
    const count = await this.model.countDocuments({ $or: [{ tagid }, { tagname }] }).exec();
    if (count > 0) {
      throw new BusinessError(ErrorCode.DATA_EXISTED, '标签已存在', 'tagid或tagname已经存在');
    }

    const res = await this.model.create({ tagid, tagname });
    return _.pick(res, TAG_PICKS);
  }

  async update(tagid, { tagid: _tagid, tagname }) {
    assert(tagid || _tagid);
    assert(tagname);
    if (!tagid) tagid = _tagid;

    // TODO:检查tagname是否重复
    const count = await this.model.countDocuments({ tagid: { $ne: tagid }, tagname }).exec();
    if (count > 0) {
      throw new BusinessError(ErrorCode.DATA_EXISTED, '标签名与其他标签重复');
    }

    const res = await this.model.findOneAndUpdate({ tagid }, { tagname }, { new: true }).exec();
    return _.pick(res, TAG_PICKS);
  }

  async delete(tagid) {
    assert(tagid);
    await this.model.deleteOne({ tagid }).exec();
  }

  // 获得标签列表
  async list() {
    return await this.model.find({}, TAG_PROJECTION).exec();
  }

  // 获取标签成员
  async fetchUsers({ tagid, tagname }) {
    assert(tagid || tagname);
    if (!tagid) {
      const tag = await this.model.findOne({ tagname }).exec();
      if (!tag) throw new BusinessError(ErrorCode.DATA_NOT_EXIST, '标签信息不存在');
      tagid = tag.tagid;
    }
    const entity = await this.mTagUser.findOne({ tagid }).exec();
    if (!entity) throw new BusinessError(ErrorCode.DATA_NOT_EXIST);
    const userlist = await this.mUser.find({ userid: { $in: entity.userlist } }, 'userid name').exec();
    return { tagname: entity.tagname, userlist, partylist: entity.partylist };
  }

  // 将用户或部门添加到标签
  async addtagusers(tagid, userlist = [], partylist = []) {
    assert(tagid);
    assert(_.isArray(userlist));
    assert(_.isArray(partylist));
    return await this.mTagUser.findOneAndUpdate({ tagid }, {
      $push: {
        userlist: { $each: userlist },
        partylist: { $each: partylist },
      },
    }, { new: true }).exec();
  }

  // 将用户或部门从标签删除
  async deltagusers(tagid, userlist = [], partylist = []) {
    assert(tagid);
    assert(_.isArray(userlist));
    assert(_.isArray(partylist));
    return await this.mTagUser.findOneAndUpdate({ tagid }, {
      $pull: {
        userlist: { $in: userlist },
        partylist: { $in: partylist },
      },
    }).exec();
  }

}

module.exports = TagService;
