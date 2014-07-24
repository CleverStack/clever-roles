module.exports = function ( Service, PermissionModel, RoleModel ) {
    return Service.extend({
        model: PermissionModel
    });
}