'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

// Dependencies
const Stripe = require('stripe');
const unparsed = require("koa-body/unparsed.js");

const signing_secret = process.env.SIGNING_SECRET;
const secret_key = process.env.SECRET_KEY;
// const stripe = Stripe(secret_key);


const paymentService = {};

paymentService.webhook = async (ctx) => {
  const payload = ctx.request.body;

  const stripe = Stripe(secret_key);
  
  const sig = ctx.request.header['stripe-signature'];
  let event;

  try {
    
    event = stripe.webhooks.constructEvent(payload[unparsed], sig, signing_secret);
  } catch (err) {
    console.log('error in stripe webhook fulfill order', err);
    return ctx.badRequest(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('session complete', session);
    // Fulfill the purchase...
    await strapi.plugins['stripe-payment-gateway-basic'].services['stripe-payment-gateway-basic'].fulfillOrder(session);
  }

  ctx.send({});
}

paymentService.createSession = async (ctx) => {
  const { productName, amount } = ctx.request.body;
  ctx.send({
    id: await strapi.plugins['stripe-payment-gateway-basic'].services['stripe-payment-gateway-basic'].createSession(productName, amount)
  });
}

module.exports = paymentService;
