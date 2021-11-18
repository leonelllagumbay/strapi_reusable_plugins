
# Strapi plugin stripe-payment-gateway-basic

This is a sample template on how to integrate Stripe with Strapi

### Prerequisite:

 - https://stripe.com/docs/stripe-cli example: stripe listen
   --forward-to [http://localhost:1337/webhook](http://localhost:1337/webhook)
 
 - [https://dashboard.stripe.com/test/dashboard]
 - (https://dashboard.stripe.com/test/dashboard)
  

 -  [https://stripe.com/docs/checkout/integration-builder](https://stripe.com/docs/checkout/integration-builder)

### Create Stripe dev account 

 - https://dashboard.stripe.com/login

### Get Stripe API Credentials

 - Publishable Key
 - Signing Secret 
 - Secret Key

### Frontend code
Follow the codes from Homepage

### Backend code
Follow the routes, controllers, and services codes
Set environment variables SIGNING_SECRET and SECRET_KEY in .env in the root Strapi folder.
Also the STRIPE_SUCCESS_REDIRECT_URL and STRIPE_CANCEL_REDIRECT_URL.

### Note
koa-body/unparsed.js must be enabled under Strapi's config/middleware file

    parser: {
	    enabled:  true,
	    multipart:  true,
	    includeUnparsed:  true,
    },

koa-body/unparsed.js must also be installed to parse the Stripes raw  payload.
Then run yarn strapi build.

That's it. Just click the 

> Pay

 button to try! Happy coding :)
