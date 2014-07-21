var async   = require( 'async' )
  , _       = require( 'underscore' );

module.exports = function ( Controller, PermissionService, RoleService, RoleModel ) {
    return Controller.extend(
    {
        requiresPermission: function( requiredPermissions, matcher ) {
            matcher = matcher || 'all';

            return function( req, res, next ) {
                var user    = req.session.passport.user
                  , action  = req.params.action
                  , method  = req.params.method;

                if ( !( requiredPermissions instanceof Array ) && typeof requiredPermissions === 'object' ) {
                    console.dir(req.params);
                    process.exit();
                } else {
                    requiredPermissions = [ requiredPermissions ];
                }

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
        }
    },
    {
        service: PermissionService
    });
}