'use strict';

const { default: createStrapi } = require("strapi");

/**
 * chatbot-simple.js controller
 *
 * @description: A set of functions called "actions" of the `chatbot-simple` plugin.
 */

module.exports = {

  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async (ctx) => {
    // Add your own logic here.

    // Send 200 `ok`
    ctx.send({
      message: 'ok'
    });
  },

  model: async (ctx) => {
    console.log('strapi', strapi);
    ctx.send({
      message: true
    });
  }
};
