'use strict';

// Dependencies
const Stripe = require('stripe');

const paymentServices = {};

paymentServices.fulfillOrder = async (session) => {
  console.log('session.success_url', session.success_url);
  console.log('session id', session.id);
  console.log('session.payment_method_types', session.payment_method_types);
  console.log('session.amount_total', session.amount_total);
  console.log('session.payment_status', session.payment_status);
  console.log('write code here to fullfill order');
}

/**
 * Create checkout session
 * @param {*} productName 
 * @param {*} amount 
 */
paymentServices.createSession = async (productName, amount) => {
  const stripe = Stripe(process.env.SECRET_KEY);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'SGD',
          product_data: {
            name: productName
          },
          unit_amount: await paymentServices.stripeAmount(amount),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.STRIPE_SUCCESS_REDIRECT_URL}/admin/plugins/stripe-payment-gateway-basic?success=true`,
    cancel_url: `${process.env.STRIPE_CANCEL_REDIRECT_URL}/admin/plugins/stripe-payment-gateway-basic?success=false`,
  });

  return session.id;
}

paymentServices.stripeAmount = async (amount) => {
  const tempNumber = 10; // Number to fix decimal rounding inconsistencies
  let fixedNumber = parseFloat(amount + tempNumber).toFixed(2); // Add temp number
  fixedNumber = (parseFloat(fixedNumber) - tempNumber).toFixed(2); // Subtract temp number to get back the original number
  return parseFloat((parseFloat(fixedNumber) * 100).toFixed(2));
}

module.exports = paymentServices;
