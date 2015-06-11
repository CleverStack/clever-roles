module.exports = function(Promise, Service, PermissionModel, async) {
  return Service.extend({

    model: PermissionModel,

    findDefaultPermissions: function(queryOptions) {
      return this.findAll({
        where: {
          AccountId        : null,
          systemPermission : true
        }
      },
      queryOptions);
    },

    createAccountDefaultPermissions: function(account, values, queryOptions) {
      return new Promise(function(resolve, reject) {
        this
        .findDefaultPermissions(queryOptions)
        .then(this.proxy(function(defaultPermissions) {
          if (!defaultPermissions.length) {
            return resolve([]);
          }

          async.map(
            defaultPermissions,
            this.proxy('createDefaultPermission', queryOptions, account),
            function(error, permissions) {
              if (!error) {
                if (permissions) {
                  account.entity.Permissions        = permissions;
                  account.entity.values.Permissions = permissions;
                }
                resolve(permissions);
              } else {
                reject(error);
              }
            }
          );
        }))
        .catch(reject);
      }
      .bind(this));
    },

    createDefaultPermission: function(queryOptions, account, defaultPermission, callback) {
      this
      .create({
        AccountId        : account.id,
        action           : defaultPermission.action,
        description      : defaultPermission.description,
        systemPermission : true
      }, queryOptions)
      .then(callback.bind(null, null))
      .catch(callback);
    }
  })
}
