/*
 *
 * HomePage
 *
 */

import React, { memo, useState } from 'react';
// import PropTypes from 'prop-types';
import pluginId from '../../pluginId';
import '@stripe/stripe-js';

const PUBLISHABLE_KEY = 'pk_test_51JBx6wCvdblaPUlmSK0wLLAy11aiyUKsyrjOnnmxdVmmaXTMfvgaQoroOAgC7zwLpdN5Qn4P9SSXomIqmm1MFkDs004z3dpOei';

const HomePage = () => {
  const [isLoading, setIsLoading] = useState();
  const pay = async () => {
    // Payment starts here
    const stripe = Stripe(PUBLISHABLE_KEY);

    // Create session from BE
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const body = JSON.stringify({
      productName: 'Sample product',
      amount: 10000
    });

    const requestOptions = {
      method: 'POST',
      headers,
      body,
      redirect: 'follow'
    };

    setIsLoading(true);
    const url = `${strapi.backendURL}/payments/create-session`;

    fetch(url, requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log('result', result);
        stripe.redirectToCheckout({ sessionId: result.id });
        setIsLoading(false);
      })
      .catch(error => console.log('error getting session from backend', error));

  }

  return (
    <div>
      <p>Happy coding Onel! {pluginId}</p>
      <button onClick={pay}>Pay now</button>
      {isLoading ? <div>Loading</div> : ''}
    </div>
  );
};

export default memo(HomePage);
