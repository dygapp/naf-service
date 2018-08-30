'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/info', controller.home.info);

  // TODO: 序列管理接口
  router.post('/seq/nextval', controller.seq.nextval);

  // TODO: 成员管理接口
  router.post('/user/create', controller.user.create);
  router.get('/user/get', controller.user.fetch);
  router.post('/user/update', controller.user.update);
  router.get('/user/delete', controller.user.delete);
  router.post('/user/batchdelete', controller.user.batchdelete);
  router.get('/user/simplelist', controller.user.simplelist);
  router.get('/user/list', controller.user.list);
  router.post('/user/passwd', controller.user.passwd);

  // TODO: 部门管理接口
  router.post('/dept/create', controller.dept.create);
  router.post('/dept/update', controller.dept.update);
  router.get('/dept/delete', controller.dept.delete);
  router.get('/dept/list', controller.dept.list);
  router.get('/dept/load', controller.dept.load);

  // TODO: 标签管理接口
  router.post('/tag/create', controller.tag.create);
  router.get('/tag/get', controller.tag.fetch);
  router.post('/tag/update', controller.tag.update);
  router.get('/tag/delete', controller.tag.delete);
  router.post('/tag/addtagusers', controller.tag.addtagusers);
  router.post('/tag/deltagusers', controller.tag.deltagusers);
  router.get('/tag/list', controller.tag.list);

  // TODO: 自动配置路由,将所有以‘Action’结尾的方法自动进行路由注册
  Object.keys(app.controller).forEach(key => {
    const c = app.controller[key];
    Object.keys(c).forEach(a => {
      if (a.endsWith('Action')) {
        const p = a.substr(0, a.length - 6);
        app.all(`/${key}${p === 'index' ? '' : ('/' + p)}`, `${key}.${a}`);
      }
    });
  });
};
