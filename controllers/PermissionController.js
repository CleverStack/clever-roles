module.exports = function ( Controller, PermissionService ) {
    return Controller.extend(
    {
    	requiresPermission: function( permission ) {
    		return function( req, res, next ) {
    			next();
    		}
    	}
    },
    {
        service: PermissionService
    });
}