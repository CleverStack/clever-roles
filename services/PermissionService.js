var Promise = require( 'bluebird' );

module.exports = function ( Service, PermissionModel, RoleModel ) {
    return Service.extend({
        model: PermissionModel,

        hasPermissions: function( user, requiredPermissions, matcher ) {
            var that = this;

            return function( req, res, next ) {
                var user = req.session.passport.user;

                async.waterfall(
                    [
                        function isAuthenticated( callback ) {
                            callback( req.isAuthenticated() ? null : 'User is not authenticated!' );
                        },

                        function lazyLoadRoles( callback ) {
                            if ( !user.role || !user.role.permissions ) {
                                RoleService
                                    .getRoleWithPerms( user.RoleId )
                                    .then( function( role ) {
                                        if ( role === null || !( role instanceof RoleModel ) ) {
                                            callback( 'Logged in user does not have a role with the "' + requiredPermission + '" permission.' );
                                        } else {
                                            user.role = role;
                                            callback( null );
                                        }
                                    })
                                    .catch( callback );
                            } else {
                                callback( null );
                            }
                        },

                        function userRoleHasPermission( callback ) {
                            if ( _.findWhere( user.role.permissions, { action: requiredPermission } ) !== undefined ) {
                                callback( null );
                            } else {
                                callback( 'Logged in user does not have ' + requiredPermission + ' permission.' );
                            }
                        }
                    ],
                    function( err ) {
                        if ( err === null ) {
                            next();
                        } else {
                            return res.send( 403, { statusCode: 403, message: err } );
                        }
                    }

                );
            }
        },

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