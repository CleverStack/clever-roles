var async   = require( 'async' )
  , _       = require( 'underscore' );

module.exports = function ( Controller, PermissionService, RoleService, RoleModel ) {
    function requiresPermission( requiredPermissions ) {
        /*
            PermissionController.requiresPermission( 'Some.permission' );
            // or
            PermissionController.requiresPermission( [ 'Some.permission', 'Another.permission' ] );
        */
        if ( requiredPermissions instanceof Array ) {
            requiredPermissions = {
                all: requiredPermissions
            }
        } else if ( typeof requiredPermissions !== 'object' ) {
            requiredPermissions = {
                all: [ requiredPermissions ]
            }
        }

        return function( req, res, next ) {
            var user = req.session.passport.user
              , method = req.method.toLowerCase()
              , action = req.params.action;

            if ( !action && method === 'get' && /^\/[^\/]+\/?$/ig.test( req.url ) ) {
                action = 'list';
            } else if ( /^[0-9a-fA-F]{24}$/.test( action ) || !isNaN( action ) ) {
                action = 'get';
            }

            async.waterfall(
                [
                    function lazyLoadRoles( callback ) {
                        if ( !user ) {
                            callback( null );
                        } else if ( !user.role || !user.role.permissions ) {
                            RoleService
                                .getRoleWithPerms( user.RoleId )
                                .then( function( role ) {
                                    if ( role === null || !( role instanceof RoleModel ) ) {
                                        callback( 'Logged in user does not have a role with the "' + requiredPermission + '" permission.' );
                                    } else {
                                        user.role = JSON.parse(JSON.stringify(role));
                                        callback( null );
                                    }
                                })
                                .catch( callback );
                        } else {
                            callback( null );
                        }
                    },

                    function determinePermissions( callback ) {
                        var actionName = ( !!action ? action : method ) + 'Action'
                          , permissions = [];

                        if ( typeof requiredPermissions[ actionName ] !== 'undefined' ) {
                            if ( requiredPermissions[ actionName ] !== null ) {
                                if ( requiredPermissions[ actionName ] instanceof Array ) {
                                    permissions = permissions.concat( requiredPermissions[ actionName ] );
                                } else {
                                    permissions.push( requiredPermissions[ actionName ] );
                                }
                            }
                        } else if ( typeof requiredPermissions.all !== 'undefined' ) {
                            if ( requiredPermissions.all !== null ) {
                                permissions = requiredPermissions.all instanceof Array ? requiredPermissions.all : [ requiredPermissions.all ];
                            }
                        }

                        callback( null, permissions );
                    },

                    function userRoleHasPermission( permissions, callback ) {
                        var hasPermission = true;

                        if ( !!permissions.length && !req.isAuthenticated() ) {
                            return callback( 'User is not authenticated!' );
                        }

                        permissions.every( function( requiredPermission ) {
                            if ( /^([^\.]+)\.\$action/.test( requiredPermission ) ) {
                                requiredPermission = RegExp.$1 + '.';

                                switch( action ) {
                                
                                case 'get':
                                    requiredPermission += 'view';
                                    break;
                                case 'post':
                                    requiredPermission += 'create';
                                    break;
                                case 'put':
                                    requiredPermission += 'edit';
                                    break;
                                default:
                                    requiredPermission += action;
                                    break;
                                }
                            }
                            if ( requiredPermission !== 'requiresLogin' && _.findWhere( [].slice.call( user.role.permissions ), { action: requiredPermission } ) === undefined ) {
                                callback( 'Logged in user does not have ' + requiredPermission + ' permission.' );
                                hasPermission = false;
                                return false;
                            }
                            return true;
                        });

                        if ( !!hasPermission ) {
                            callback( null );
                        }
                    }
                ],
                function( err ) {
                    if ( err === null ) {
                        next();
                    } else {
                        res.send( 401, { statusCode: 401, message: err } );
                    }
                }

            );
        }
    }

    return Controller.extend(
    {  
        service: PermissionService,
        
        autoRouting: [
            requiresPermission({
                all: 'Permission.$action'
            })
        ],

        requiresPermission: requiresPermission
    },
    {

    });
}