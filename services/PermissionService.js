module.exports = function(Promise, Service, PermissionModel, RoleModel) {
  return Service.extend({
    
    model: PermissionModel,

    create: function(data, options) {
      var service = this
        , create  = this._super;

      options = options || {};

      return new Promise(function(resolve, reject) {
        create.apply(service, [{
          action:      data.action,
          description: data.description   ? data.description : null,
          AccountId:   data.AccountId     ? data.AccountId : null
        }, options ])
        .then(function(permission) {
          return service.handleRoles(permission, data.Roles, options);
        })
        .then(resolve)
        .catch(reject);
      });
    },

    update: function(idOrWhere, data, options) {
      var service = this
        , update  = this._super;

      options = options || {};

      return new Promise(function(resolve, reject) {
        update.apply(service, [idOrWhere, {
          action:      data.action,
          description: data.description   ? data.description : null,
          AccountId:   data.AccountId     ? data.AccountId : null
        }])
        .then(function(permission) {
          return service.handleRoles(permission, data.Roles, options);
        })
        .then(resolve)
        .catch(reject);
      });
    },

    handleRoles: function(permission, roleIds, options) {
      return new Promise(function(resolve, reject) {
        if (!roleIds || !roleIds.length) {
          return resolve(permission);
        }

        RoleModel
        .findAll({
          where: {
            id: {
              in: roleIds
            }
          }
        }, options)
        .then(function(roles) {
          permission.setRoles(roles).then(function() {
            resolve(permission);
          })
          .catch(reject);
        })
        .catch(reject);
      });
    }
  });
}