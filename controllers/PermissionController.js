var async   = require( 'async' )
  , _       = require( 'underscore' );

module.exports = function( Controller, PermissionService, RoleService, RoleModel ) {
    var PermissionController = Controller.extend(
    {  
        service: PermissionService,

        route: [
            '[POST] /account/:accountId/permission/?',
            '/account/:accountId/permission/:id/?',
            '/account/:accountId/permission/:id/:action/?',
            '/account/:accountId/permissions/?',
            '/account/:accountId/permissions/:action/?'
        ],

        autoRouting: [
            function( req, res, next ) {
                return PermissionController.requiresPermission({
                    all: 'Permission.$action'
                })( req, res, next );
            }
        ],

        requiresPermission: function( requiredPermissions ) {
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
                var user    = req.user
                  , method  = req.method.toLowerCase()
                  , id      = req.params.id
                  , action  = req.params.action || id;

                if ( !!id && !!action && action === 'list' ) {
                    action = 'get'
                    req.params.action = 'get';
                } else if ( !action && method === 'get' && /^\/.*\/(.*\/?)$/ig.test( req.url ) ) {
                    action = 'list';
                } else if ( /^[0-9a-fA-F]{24}$/.test( action ) || !isNaN( action ) ) {
                    action = 'get';
                } else {
                    if ( req.params.action ) {
                        action = req.params.action;
                    } else if ( method === 'get' && !id ) {
                        action = 'list';
                    } else {
                        action = method;
                    }
                }
                
                async.waterfall(
                    [
                        function lazyLoadRoles( callback ) {
                            if ( !user ) {
                                callback( null );
                            } else if ( !user.role || !user.role.permissions ) {
                                RoleService
                                    .find({
                                        where: {
                                            id: user.RoleId
                                        },
                                        include: [ PermissionService.model ]
                                    })
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
                            console.dir(err);
                            res.send( 401, { statusCode: 401, message: err } );
                        }
                    }

                );
            }
        }
    },
    {
        listAction: function() {
            if ( this.req.query.AccountId !== undefined && this.req.query.AccountId != this.req.user.account.id ) {
                return this.send( 200, [] );
            }
            this.req.query.AccountId = this.req.user.account.id;
            this._super.apply( this, arguments );
        },

        getAction: function() {
            if ( this.req.query.AccountId !== undefined && this.req.query.AccountId != this.req.user.account.id ) {
                return this.handleServiceMessage({ statuscode: 400, message: this.Class.service.model._name + " doesn't exist." })
            }
            this.req.query.AccountId = this.req.user.account.id;
            this._super.apply( this, arguments );
        },

        postAction: function() {
            this.req.body.AccountId = this.req.user.account.id;
            this._super.apply( this, arguments );
        },

        putAction: function() {
            if ( this.req.query.AccountId !== undefined && this.req.query.AccountId != this.req.user.account.id ) {
                return this.handleServiceMessage({ statuscode: 400, message: this.Class.service.model._name + " doesn't exist." })
            }
            this.req.query.AccountId = this.req.user.account.id;
            this._super.apply( this, arguments );
        },

        deleteAction: function() {
            if ( this.req.query.AccountId !== undefined && this.req.query.AccountId != this.req.user.account.id ) {
                return this.handleServiceMessage({ statuscode: 400, message: this.Class.service.model._name + " doesn't exist." })
            }
            this.req.query.AccountId = this.req.user.account.id;
            this._super.apply( this, arguments );
        }
    });

    return PermissionController;
}
