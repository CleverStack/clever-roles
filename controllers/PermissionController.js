module.exports = function ( Controller, PermissionService ) {
    return Controller.extend({
        service: PermissionService
    });
}