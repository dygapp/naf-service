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
    this.mDept = this.ctx.model.Dept;
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
  async fetchMembers({ tagid, tagname }) {
    assert(tagid || tagname);
    if (!tagid) {
      const tag = await this.model.findOne({ tagname }).exec();
      if (!tag) throw new BusinessError(ErrorCode.DATA_NOT_EXIST, '标签信息不存在');
      tagid = tag.tagid;
    }
    const entity = await this.mTagUser.findOne({ tagid }).exec();
    if (!entity) return { tagid, userlist: [], partylist: [] };
    const userlist = await this.mUser.find({ userid: { $in: entity.userlist } }, 'userid name department').exec();
    const partylist = await this.mDept.find({ id: { $in: entity.partylist } }, 'id name').exec();
    return { tagid, userlist, partylist };
  }

  // 将用户或部门添加到标签
  async addtagusers(tagid, userlist = [], partylist = []) {
    assert(tagid);
    assert(_.isArray(userlist));
    assert(_.isArray(partylist));
    const entity = await this.mTagUser.findOne({ tagid }).exec();
    if (!entity) {
      return await this.mTagUser.create({ tagid, userlist, partylist });
    }
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

  // 获取标签用户
  async fetchTagUser({ tagid, tagname }) {
    assert(tagid || tagname);
    if (!tagid) {
      const tag = await this.model.findOne({ tagname }).exec();
      if (!tag) throw new BusinessError(ErrorCode.DATA_NOT_EXIST, '标签信息不存在');
      tagid = tag.tagid;
    }
    const entity = await this.mTagUser.findOne({ tagid }).exec();
    if (!entity) return { tagid, userlist: [] };

    // TODO: 查找标签中用户
    let userlist = await this.mUser.find({ userid: { $in: entity.userlist } }, 'userid name').exec();
    // TODO: 查找所有路径节点在标签中的部门的ID
    const partylist = await this.mDept.find({ path: { $elemMatch: { $in: entity.partylist } } }, 'id').exec().map(p => p.id);
    if (partylist && partylist.length > 0) {
      // TODO: 通过部门ID查找用户
      const partyuser = await this.mUser.find({ department: { $elemMatch: { $in: partylist } } }, 'userid name').exec();
      userlist = userlist.concat(partyuser)
        .reduce((p, c) => { // 去重处理
          if (!p.some(i => i.userid === c.userid)) {
            return p.concat(c);
          }
          return p;
        }, []);
    }
    return userlist;
  }

  // 获取用户标签
  async fetchUserTag({ userid }) {
    assert(userid);
    const user = await this.mUser.findOne({ userid }, 'userid name department').exec();
    if (!user) {
      throw new BusinessError(ErrorCode.user.DATA_NOT_EXIST, '用户信息不存在');
    }
    // TODO: 查找用户所有的上级部门ID
    const partylist = await this.mDept.find({ path: { $elemMatch: { $in: user.department } } }, 'id').exec().map(p => p.id);
    // TODO: 按部门ID和用户ID查找标签
    let tags = await this.mTagUser.findOne({ $or: {
      userlist: { $elemMatch: { $eq: userid } },
      partylist: { $elemMatch: { $in: partylist } },
    } }).exec().map(p => p.tagid);
    tags = this.model.find({ tagid: { $in: tags } }).exec().map(p => p.tagname);
    return tags;
  }
}

module.exports = TagService;
