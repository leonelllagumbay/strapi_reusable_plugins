'use strict';

/**
 * sso-azure-ad.js controller
 *
 * @description: A set of functions called "actions" of the `sso-azure-ad` plugin.
 */

// const msal = require('@azure/msal-node');
const https = require('https');

const roleMap = [{
  azureRole: 'Application Administrator',
  strapiRole: 'Super Admin'
}, {
  azureRole: 'Application Developer',
  strapiRole: 'Technologist'
}];

const getMyRoles = async (azureToken, profileId) => {
  return new Promise(async (resolve, reject) => {
    const req = https.request({
      'method': 'GET',
      'hostname': 'graph.microsoft.com',
      'path': `/v1.0/me/memberOf`,
      'headers': {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + azureToken
      },
      'maxRedirects': 20
    }, function (resp) {
      let data = '';
      // A chunk of data has been received.
      resp.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received.
      resp.on('end', () => {
        resolve(JSON.parse(data));
      });
    }).on("error", (error) => {
      reject(error);
    });

    req.end();
  });
}

const getProfileData = async (azureToken) => {
  return new Promise(async (resolve, reject) => {
    const req = https.request({
      'method': 'GET',
      'hostname': 'graph.microsoft.com',
      'path': '/v1.0/me',
      'headers': {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + azureToken
      },
      'maxRedirects': 20
    }, function (resp) {
      let data = '';
      // A chunk of data has been received.
      resp.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        resolve(JSON.parse(data));
      });
    }).on("error", (error) => {
      reject(error);
    });

    req.end();
  });
}

const mapRoles = async (rolesToAdd, roles) => {
  for (let role of roleMap) {
    if (roles.indexOf(role.azureRole) > -1) {
      const correspondingRoleInStapi = await strapi.query('role', 'admin').findOne({
        name: role.strapiRole
      }, ['name']);
      rolesToAdd.push(correspondingRoleInStapi.id);
    }
  }
  return rolesToAdd;
}

const getUserData = (userProfile, rolesToAdd) => {
  return {
    roles: rolesToAdd,
    firstname: userProfile.givenName,
    lastname: userProfile.surname,
    username: userProfile.displayName,
    email: userProfile.userPrincipalName ? userProfile.userPrincipalName : userProfile.mail,
    isActive: true,
    blocked: false,
  }
}

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

  verifyTokenAzureActiveDirectory: async (ctx) => {
    const {azureToken} = ctx.request.body;

    try {
      // Get profile data
      let profileData = await getProfileData(azureToken);
      console.log('profile data', profileData);
      let roleList = await getMyRoles(azureToken, profileData.id);
      console.log('getAppRoleAssignments', roleList);
      const roles = roleList.value.map(role => role.displayName);
      console.log('roles now', roles);
      const mail = profileData.userPrincipalName ? profileData.userPrincipalName : profileData.mail;

      // Query user by email
      const userModel = await strapi.query('user', 'admin').findOne({
        email: mail
      });
      let rolesToAdd = [];
      if (userModel) {
        // Update user role
        rolesToAdd = await mapRoles(rolesToAdd, roles);
        
        await strapi.query('user', 'admin').update({
          id: userModel.id
        }, getUserData(profileData, rolesToAdd));
      } else {
        rolesToAdd = await mapRoles(rolesToAdd, roles);
        await strapi.query('user', 'admin').create(getUserData(profileData, rolesToAdd))
      }

      const processedUser = await strapi.query('user', 'admin').findOne({email: mail});
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
      console.log('error', error);
      return ctx.badRequest(error);
    }

    // Map user role
    // Create user if not exist in Strapi
  }
};
