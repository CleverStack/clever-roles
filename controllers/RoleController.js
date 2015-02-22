module.exports = function(Controller, RoleService, PermissionController, AccountController) {
  return Controller.extend(
  {
    service: RoleService,
    
    route: [
      '/account/:AccountId/role/:id/?',
      '/account/:AccountId/role/:id/:action/?',
      '/account/:AccountId/roles/?',
      '/account/:AccountId/roles/:action/?'
    ],

    autoRouting: [
      PermissionController.requiresPermission({
        all: 'Role.$action'
      }),

      AccountController.addAccountIdToRequest({
        all             : false,
        listAction      : true,
        getAction       : true,
        postAction      : true,
        putAction       : true,
        deleteAction    : true
      })
    ]
  },
  {
    
    assignAction: function () {
      var roleId = this.req.params.id
        , users = this.req.body.users
        , removed = this.req.body.removed;

      users = !users || !Array.isArray(users) ? [] : users;
      removed = !removed || !Array.isArray(removed) ? [] : removed;

      RoleService
        .listRolesWithPerm(accId, roleId)
        .then(function(role) {
          return [role, RoleService.assignRole(accId, users, removed, role)];
        })
        .spread(function(role) {
          return RoleService.getRoleCounts(role, accId);
        })
        .then(this.proxy('handleServiceMessage'))
        .catch(this.proxy('handleException'));
    }

  });
}
