'use strict';

const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');

// [{
//   awsRole: 'arn:aws:iam::994583806537:role/Admin',
//   strapiRole: 'Super Admin'
// }, {
//   awsRole: 'arn:aws:iam::994583806537:role/Technologist',
//   strapiRole: 'Technologist'
// }];

const getTokenInfo = (ssoToken) => {
  return new Promise(async (resolve, reject) => {
    AWS.config.credentials.get(async (err) => {
      if (!err) {
        console.log('process.env.COGNITO_JWKS', process.env.COGNITO_JWKS);
        const jwks = process.env.COGNITO_JWKS ? JSON.parse(process.env.COGNITO_JWKS) : {};
        // See Amazon cognito API to get jwks
        // { "keys": [{ "alg": "RS256", "e": "AQAB", "kid": "Z2MsSpAMRQTIFjNSk1srITFdyfgZWM0ixym7PpyGZMs=", "kty": "RSA", "n": "wpKO6kRICmnE-Q_eVI5C7OB2xHgehu9EC6RvczvUEB3orV8wjltYKFN6kfqUawIKyPPKgUEZKasuPTlMlNExZZEtJL2EYC94EcdZWprXDdnutNWYMcciLsg9Kr1PzFnsgrDRpJRQMxxVk7xXj1SLMJLqlqQreuqBeNE6AtAGBrJJKuzsAO_2J9bgG-DGSN79R5lKKqzxvj1ZhcA95wiC5nN9vykUbkKDaV3-nfniE_BVvSMjnO-y_NDFpVA60MmTWJVlrvs4lGsIMMhI17kHzEk0Lfan44y02L-jIA1ygATUP8wcJFLOVY1WYbLW9KSg2G3594ux9HF_ps5q-klj-w", "use": "sig" }, { "alg": "RS256", "e": "AQAB", "kid": "T1wa7JZwouSg/hrnWMnmSnS6CT6E7TAy/bk2Arfwm3Q=", "kty": "RSA", "n": "tYuW15Eo0GMiLPwCcEd3LmXR3J1U1aW8qkm31dkqGFmSzXe5D8j7tIEfWwyfuwyKLMNfDYhI9mTZIiZrqgcRP9bp9xdxJLGY86rZiU9Zapx4XtGbJii2Rrjyz3TZ4leSien00SY7PYMk45w_Zx1A6xZ517cxLHuyFHRK0LepX5Q4zLydqzU3GfkKR1Fkxib0OMEybe0Dt9fJBeupwi5a5u--zZNvOX1QoD8ud4NSL-Si7sbbIpXeOfCjTMMxe5LSREv2_7wKsVSbhxHayMJlsjQLhjWNWSL_jTjrWZvvzwfVf6fwok_HIPwvxng90txBy8OXUzlkIzNgS1UTthRuzw", "use": "sig" }] };
        const [headerEncoded] = ssoToken.split('.');
        const buff = Buffer.from(headerEncoded, 'base64');
        const header = JSON.parse(buff.toString('ascii'));
        let jsonWebKey;
        for (let jwk of jwks.keys) {
          if (jwk.kid === header.kid) {
            jsonWebKey = jwk;
          }
        }
        const pem = jwkToPem(jsonWebKey);
        const payload = jwt.verify(ssoToken, pem, { algorithms: ['RS256'] });
        resolve(payload);
      } else {
        reject(err.toString());
      }
    });
  })
}

/**
 * sso-aws-cognito.js controller
 *
 * @description: A set of functions called "actions" of the `sso-aws-cognito` plugin.
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

  verifyToken: async (ctx) => {
    const { ssoToken } = ctx.request.body;

    const region = process.env.COGNITO_REGION;
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const identityPoolId = process.env.COGNITO_IDENTITY_POOL_ID; // 'us-east-1:122db3b7-8819-45c0-8c93-abbcad58de1f';
    AWS.config.region = region;

    const Logins = {};
    Logins[
      `cognito-idp.${region}.amazonaws.com/${userPoolId}`
    ] = ssoToken;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: identityPoolId,
      Logins,
    });

    try {
      const tokenInfo = await getTokenInfo(ssoToken);
      // Query user by email
      const userModel = await strapi.query('user', 'admin').findOne({
        email: tokenInfo.email
      });
      let rolesToAdd = [];
      if (userModel) {
        // Update user role
        // Map your user's AWS Cognito roles to Strapi roles
        const roleMap = process.env.COGNITO_ROLE_MAPPING ? JSON.parse(process.env.COGNITO_ROLE_MAPPING) : [];
        console.log('role map', roleMap);
        for (let role of roleMap) {
          if (tokenInfo['cognito:roles'].indexOf(role.awsRole) > -1) {
            const correspondingRoleInStapi = await strapi.query('role', 'admin').findOne({
              name: role.strapiRole
            }, ['name']);
            rolesToAdd.push(correspondingRoleInStapi.id);
          }
        }

        await strapi.query('user', 'admin').update({
          id: userModel.id
        }, {
          roles: rolesToAdd,
          firstname: tokenInfo['given_name'],
          lastname: tokenInfo['family_name'],
          username: tokenInfo['cognito:username'],
          email: tokenInfo.email,
          isActive: true,
          blocked: false,
        });
      } else {
        for (let role of roleMap) {
          if (tokenInfo['cognito:roles'].indexOf(role.awsRole) > -1) {
            console.log('role.strapiRole', role.strapiRole);
            const correspondingRoleInStapi = await strapi.query('role', 'admin').findOne({
              name: role.strapiRole
            }, ['name']);
            rolesToAdd.push(correspondingRoleInStapi.id);
          }
        }
        await strapi.query('user', 'admin').create({
          username: tokenInfo['cognito:username'],
          email: tokenInfo.email,
          roles: [rolesToAdd],
          isActive: true,
          blocked: false,
          firstname: tokenInfo['given_name'],
          lastname: tokenInfo['family_name']
        })
      }

      const processedUser = await strapi.query('user', 'admin').findOne({ email: tokenInfo.email });
      ctx.state.user = processedUser;

      const { user } = ctx.state;

      strapi.eventHub.emit('admin.auth.success', { user, provider: 'local' });

      ctx.body = {
        data: {
          token: strapi.admin.services.token.createJwtToken(user),
          user: strapi.admin.services.user.sanitizeUser(ctx.state.user), // TODO: fetch more detailed info
        },
      };
    } catch (error) {
      return ctx.badRequest(error);
    }

    // Map user role
    // Create user if not exist in Strapi
  },

  getSettings: async (ctx) => {
    const data = await strapi.plugins['sso-aws-cognito'].services['sso-aws-cognito'].getSettings();

    ctx.body = { data };
  },

  updateSettings: async (ctx) => {
    const {
      request: { body },
    } = ctx;

    console.log('update settings body', body);

    await strapi.plugins['sso-aws-cognito'].services['sso-aws-cognito'].setSettings(body);

    ctx.body = { data };
  },
};
