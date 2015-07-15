export default function(Service, Promise, RoleModel, PermissionService, underscore, async) {
  
  return Service.extend({
    model: RoleModel,

    'AccountModel afterCreate'(account, values, queryOptions = {}, callback) {
      Promise.all([
        this.findDefaultRoles(queryOptions),
        PermissionService.createAccountDefaultPermissions(account, values, queryOptions)
      ])
      .spread((defaultRoles, defaultPermissions) => {
        if (!defaultRoles.length) {
          if (this.debug.enabled) {
            this.debug('found no default roles for an account!');
          }
          return callback(null);
        } else if (this.debug.enabled) {
          this.debug('creating %s default roles for new account...', defaultRoles.length);
        }

        async.map(
          defaultRoles,
          (defaultRole, createCallback) => {
            let Permissions = [];

            if (defaultRole.Permissions) {
              defaultRole.Permissions.forEach((rolePermission) => {
                let permission;
                if (!!(permission = underscore.findWhere(defaultPermissions, { action: rolePermission.action }))) {
                  Permissions.push(permission.entity);
                }
              });
            }

            this.
              create({
                AccountId   : account.id,
                systemRole  : true,
                name        : defaultRole.name,
                description : defaultRole.description,
                Permissions : Permissions
              }, queryOptions )
              .then(createCallback.bind(null, null))
              .catch(createCallback)
          },
          (error, roles) => {
            if (error === undefined || error === null) {
              if (roles) {
                account.entity.Roles        = roles;
                account.entity.values.Roles = roles;
              }
              callback(null, values);
            } else {
              callback(error);
            }
          }
        );
      })
      .catch(callback);
    },

    findDefaultRoles(queryOptions = {}) {
      let findOptions = {where: {
        AccountId  : null,
        systemRole : true
      }};
      return this.findAll(findOptions, queryOptions);
    }

  });

};
