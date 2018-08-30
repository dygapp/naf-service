'use strict';

const is = require('is-type-of');

// this 就是 ctx 对象，在其中可以调用 ctx 上的其他方法，或访问属性
module.exports = {
  get requestparam() {
    return { ...this.query, ...this.request.body };
  },

  // 返回JSON结果
  json(errcode = 0, errmsg = 'ok', data = {}) {
    if (is.object(errmsg)) {
      data = errmsg;
      errmsg = 'ok';
    }
    this.body = { errcode, errmsg, ...data };
  },
  success(message = 'ok', data = {}) {
    this.json(0, message, data);
  },
  fail(errcode, errmsg, details) {
    this.json(errcode, errmsg, { details });
  },
  ok(message, data) {
    this.success(message, data);
  },

};
