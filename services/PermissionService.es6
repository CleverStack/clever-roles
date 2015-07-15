export default function(Service, Promise, PermissionModel, async) {

  return Service.extend({
    model: PermissionModel,

    findDefaultPermissions(queryOptions = {}) {
      let findOptions = {where: {
        AccountId: null,
        systemPermission: true
      }};
      return this.findAll(findOptions, queryOptions);
    },

    createAccountDefaultPermissions(account, values, queryOptions = {}) {
      return new Promise((resolve, reject) => {
        this
          .findDefaultPermissions(queryOptions)
          .then(this.proxy('createDefaultPermissions', queryOptions, account, resolve, reject))
          .catch(reject);
      });
    },

    createDefaultPermissions(queryOptions = {}, account, resolve, reject, defaultPermissions) {
      if (!defaultPermissions.length) {
        return resolve([]);
      }

      async.map(
        defaultPermissions,
        this.proxy('createDefaultPermission', queryOptions, account),
        (error, permissions) => {
          if (error !== undefined && error !== null) {
            reject(error);
          } else {
            if (permissions && permissions.length) {
              account.entity.Permissions = account.entity.values.Permissions = permissions;

              resolve(permissions);
            } else {
              resolve([]);
            }
          }
        }
      );
    },

    createDefaultPermission(queryOptions = {}, account, defaultPermission, callback) {
      let values = {
        AccountId        : account.id,
        action           : defaultPermission.action,
        description      : defaultPermission.description,
        systemPermission : true
      };

      this
        .create(values, queryOptions)
        .then(callback.bind(null, null))
        .catch(callback);
    }

  });

}
