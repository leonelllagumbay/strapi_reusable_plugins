/*
 *
 * HomePage
 *
 */

import React, { memo, useEffect } from 'react';
// import PropTypes from 'prop-types';
import pluginId from '../../pluginId';
import {
  SettingsPageTitle,
  SizedInput,
  useGlobalContext,
  request,
  getYupInnerErrors,
} from 'strapi-helper-plugin';

const HomePage = () => {
  console.log('strapi from cognito plugin', strapi);
  const globalContext = useGlobalContext();
  console.log('global context', globalContext);

  useEffect(() => {
    // strapi.lockApp();
    strapi.notification.toggle({
      type: 'success',
      message: { id: 'app.notification.success', defaultMessage: 'Saved!' },
      title: 'Oh my title!!!',
      link: { url: 'https://google.com', label: 'Go to Google', target: '_blank' },
      timeout: 5000,
    });
  }, [])

  return (
    <div>
      <SettingsPageTitle name="AWS Cognito Settings" />
    </div>
  );
};

export default memo(HomePage);
