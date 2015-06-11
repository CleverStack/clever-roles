module.exports = function(Promise, Service, RoleModel, PermissionService, underscore, async) {
  var debug = require('debug')('cleverstack:services:RoleService');
  
  return Service.extend({
    model: RoleModel,

    'AccountModel afterCreate': function(account, values, queryOptions, callback) {
      Promise.all([
        this.findDefaultRoles(queryOptions),
        PermissionService.createAccountDefaultPermissions(account, values, queryOptions)
      ])
      .spread(function(defaultRoles, defaultPermissions) {
        if (!defaultRoles.length) {
          if (debug.enabled) {
            debug('found no default roles for an account!');
          }
          return callback(null);
        } else if (debug.enabled) {
          debug('creating %s default roles for new account...', defaultRoles.length);
        }

        async.map(
          defaultRoles,
          this.proxy(function createDefaultRole(defaultRole, createCallback) {
            var Permissions = [];

            if (defaultRole.Permissions) {
              defaultRole.Permissions.forEach(function(rolePermission) {
                var permission = underscore.findWhere(defaultPermissions, { action: rolePermission.action });
                if (permission) {
                  Permissions.push(permission.entity);
                }
              });
            }

            this
            .create({
              AccountId   : account.id,
              systemRole  : true,
              name        : defaultRole.name,
              description : defaultRole.description,
              Permissions : Permissions
            }, queryOptions )
            .then(createCallback.bind(null, null))
            .catch(createCallback)
          }),
          function(error, roles) {
            if (!error) {
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
      }
      .bind(this))
      .catch(callback);
    },

    findDefaultRoles: function(queryOptions) {
      return this.findAll({
        where: {
          AccountId  : null,
          systemRole : true
        }
      },
      queryOptions);
    }
  });
};
