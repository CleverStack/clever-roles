var Promise = require( 'bluebird' );

module.exports = function ( Service, PermissionModel, RoleModel ) {
    return Service.extend({
        model: PermissionModel,

        hasPermissions: function ( req, permissions, booleanLogic ) {
            return new Promise( function( resolve, reject ) {
                permissions = Array.isArray ( permissions ) ? permissions : [ permissions ];

                booleanLogic = booleanLogic === "any" ? 'any' : 'all';

                var isAuthed = req.isAuthenticated () && req.user.role
                  , booleanCount = 0;

                if ( !isAuthed ) {
                    return reject( 'User is not authorized' );
                }

                if ( req.user && req.user.hasAdminRight === true ) {
                    return resolve();
                }

                if ( !permissions.length ) {
                    return resolve();
                }

                RoleModel.find({
                    where: { id: req.user.role.id },
                    include: [ PermissionModel ]
                })
                .success( function( userPermissions ) {
                    if ( !userPermissions.permissions.length ) {
                        resolve();
                    }

                    var permissionArray = userPermissions.permissions.map( function( perm ) {
                        return perm.action;
                    });

                    permissionArray.forEach( function( perm ) {
                        if ( ~permissions.indexOf( perm ) ) {
                            ++booleanCount;
                        }
                    });

                    resolve( ( booleanLogic === "any" && booleanCount > 0 ) || ( booleanLogic === "all" && booleanCount === permissions.length ) );
                })
                .error( reject );
            });
        } 
    });
}