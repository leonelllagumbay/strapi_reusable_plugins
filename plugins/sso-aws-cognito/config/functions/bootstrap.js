'use strict';

const _ = require('lodash');
const uuid = require('uuid/v4');
const awsCognitoPermissionsActions = require('../sso-aws-cognito-actions');

module.exports = async () => {
  // set plugin store
  const pluginStore = strapi.store({
    type: 'plugin',
    name: 'sso-aws-cognito',
    key: 'settings',
  });

  console.log('pluginStore awst', await pluginStore.get());

  const grantConfig = {
    awsCognito: {
      enabled: true,
      icon: 'envelope',
    },
  }

  const prevGrantConfig = (await pluginStore.get({ key: 'grant' })) || {};
  // store grant auth config to db
  // when plugin_users-permissions_grant is not existed in db
  // or we have added/deleted provider here.
  if (!prevGrantConfig || !_.isEqual(_.keys(prevGrantConfig), _.keys(grantConfig))) {
    // merge with the previous provider config.
    _.keys(grantConfig).forEach(key => {
      if (key in prevGrantConfig) {
        grantConfig[key] = _.merge(grantConfig[key], prevGrantConfig[key]);
      }
    });
    await pluginStore.set({ key: 'grant', value: grantConfig });
  }

  console.log('pluginStore', pluginStore);


  // if provider config does not exist set one by default
  const config = await pluginStore.get();
  console.log('store config', config);

  if (!config) {
    await pluginStore.set({
      value: {
        enabled: false,
        clientId: '',
        region: '',
        scope: 'aws.cognito.signin.user.admin+email+openid+phone+profile',
        redirectUri: '',
        domain: '',
        userPoolId: '',
        identityPoolId: '',
        jwks: [],
        roleMap: []
      },
    });
  }

  await strapi.admin.services.permission.actionProvider.registerMany(
    awsCognitoPermissionsActions.actions
  );
}