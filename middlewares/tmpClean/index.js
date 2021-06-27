const bodyClean = require('koa-body-clean');

module.exports = strapi => {
  return {
    initialize() {
      strapi.app.use(bodyClean());
      // strapi.app.use(async (ctx, next) => {
      //   const start = Date.now();
      //   console.log('start time', start,);

      //   await bodyClean()(ctx, next);

      //   // const delta = Math.ceil(Date.now() - start);

      //   // ctx.set('X-Response-Time', delta + 'ms');
      // });
    },
  };
};