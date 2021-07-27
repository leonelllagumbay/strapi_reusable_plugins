module.exports = strapi => {
  const hook = {
    /**
     * Default options
     */

    defaults: {
      // config object
    },

    /**
     * Initialize the hook
     */

    async initialize() {
      // Apply labels accordingly
      console.log('init')
      try {
        // Set 1 as super admin
        await strapi.query('role', 'admin').update({ id: 1 }, { name: 'Super Admin', description: 'Super admin used by Strapi developers' });
        // Set 2 as Administrator
        await strapi.query('role', 'admin').update({ id: 2 }, { name: 'Admin', description: 'Ultragram CMS Administrators' });
        // Set 3 as Technologist
        await strapi.query('role', 'admin').update({ id: 3 }, { name: 'Technologist', description: 'Users who can also upload dicom images and reports' });

      } catch (err) {
        console.log('query role admin err', err);
      }

      try {
        // Make sure that admin has its minimum permissions to work
        // 1. Settings access users and role
        const mustHaveForUsers = [];

        let permission;

        for (let mustHave of mustHaveForUsers) {
          if (mustHave.subject) {
            try {
              permission = await strapi.query('permission', 'admin').findOne({
                role: mustHave.role,
                action: mustHave.action,
                subject: mustHave.subject
              });
            } catch (err) {
              console.log('err hook 1', err, mustHave);
            }
          } else {
            try {
              permission = await strapi.query('permission', 'admin').findOne({
                role: mustHave.role,
                action: mustHave.action
              });
            } catch (err) {
              console.log('err hook 2', err, mustHave);
            }
          }

          if (mustHave.remove) {
            if (permission) { // Remove the permission that the role should not have
              try {
                await strapi.query('permission', 'admin').delete({
                  id: permission.id
                });
              } catch (err) {
                console.log('err hook delete 1', err);
              }

            }
          } else {
            if (!permission) {
              // Add that role if not to be remove and not existing
              try {
                await strapi.query('permission', 'admin').create({
                  role: mustHave.role,
                  action: mustHave.action,
                  subject: mustHave.subject,
                  fields: mustHave.fields,
                  conditions: mustHave.conditions
                });
              } catch (err) {
                console.log('err hook 3', err, mustHave);
              }

            } else {
              // Update to make sure the roles and permissions are right
              try {
                await strapi.query('permission', 'admin').update({
                  id: permission.id
                }, {
                  subject: mustHave.subject,
                  fields: mustHave.fields,
                  conditions: mustHave.conditions
                });
              } catch (err) {
                console.log('err hook 4', err, mustHave);
              }
            }
          }
        }

        // Make sure public permissions are public
        console.log('public role');
        const userRole = await strapi.query('role', 'users-permissions').findOne({
          name: 'Public'
        }, ['name']);
        let permissionsForPublic = [];
        if (userRole) {
          permissionsForPublic = [{
            type: 'sso-aws-cognito-basic',
            role: userRole.id,
            controller: 'sso-aws-cognito-basic',
            action: 'verifytoken',
            enabled: true,
          }, {
            type: 'sso-aws-cognito-basic',
            role: userRole.id,
            controller: 'sso-aws-cognito-basic',
            action: 'verifytokenapiuser',
            enabled: true,
          }, {
            type: 'sso-azure-ad-basic',
            role: userRole.id,
            controller: 'sso-azure-ad-basic',
            action: 'verifytokenazureactivedirectory',
            enabled: true,
          }, {
            type: 'sso-azure-ad-basic',
            role: userRole.id,
            controller: 'sso-azure-ad-basic',
            action: 'verifytokenapiuser',
            enabled: true,
          }];
        }

        // Make sure authenticated permissions are authenticated
        console.log('authenticated role');
        const userRoleAuthenticated = await strapi.query('role', 'users-permissions').findOne({
          name: 'Authenticated'
        }, ['name']);
        let permissionsForAuthenticated = [];
        if (userRoleAuthenticated) {
          permissionsForAuthenticated = [];
        }

        // Make sure authenticated permissions are authenticated
        console.log('authenticated roles');
        let userRoleServiceAdmin = await strapi.query('role', 'users-permissions').findOne({
          name: 'Service Admin'
        }, ['name']);

        if (!userRoleServiceAdmin) {
          await strapi.query('role', 'users-permissions').create({
            id: 3,
            name: 'Service Admin'
          });

          userRoleServiceAdmin = await strapi.query('role', 'users-permissions').findOne({
            name: 'Service Admin'
          }, ['name']);
        }


        let permissionsForServiceAdmin = [];
        if (userRoleServiceAdmin) {
          permissionsForServiceAdmin = [];
        }

        const permissions = [...permissionsForPublic, ...permissionsForAuthenticated, ...permissionsForServiceAdmin];

        for (let permission of permissions) {
          const userPermissions = await strapi.query('permission', 'users-permissions').findOne({
            type: permission.type,
            role: permission.role,
            controller: permission.controller,
            action: permission.action
          });
          if (userPermissions) {
            try {
              await strapi.query('permission', 'users-permissions').update({
                id: userPermissions.id
              }, {
                enabled: true
              });
            } catch (err) {
              console.log('public permission err 1', err);
            }
          } else {
            try {
              await strapi.query('permission', 'users-permissions').create({
                type: permission.type,
                role: permission.role,
                controller: permission.controller,
                action: permission.action,
                enabled: true
              });
            } catch (err) {
              console.log('public permission err 2', err);
            }
          }
        }

      } catch (err) {
        console.log('hook permission err', err);
      }
    }
  };

  return hook;
}

