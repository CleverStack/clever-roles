module.exports = function( Controller, RoleService, PermissionController ) {
    return Controller.extend(
    {
        service: RoleService,
        
        route: [
            '[POST] /account/:accountId/role/?',
            '/account/:accountId/role/:id/?',
            '/account/:accountId/role/:id/:action/?',
            '/account/:accountId/roles/?',
            '/account/:accountId/roles/:action/?'
        ],

        autoRouting: [
            PermissionController.requiresPermission({
                all: 'Role.$action'
            })
        ],

        requiresRole: function( requiredRoles ) {
            /*
                RoleController.requiresRole( 'SomeRole' );
                // or
                RoleController.requiresRole( [ 'SomeRole', 'OtherRole' ] );
            */
            if ( requiredRoles instanceof Array ) {
                requiredRoles = {
                    all: requiredRoles
                }
            } else if ( typeof requiredRoles !== 'object' ) {
                requiredRoles = {
                    all: [ requiredRoles ]
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
                            } else if ( !user.role ) {
                                RoleService
                                    .find({
                                        where: {
                                            id: user.RoleId
                                        }
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

                        function determineRoles( callback ) {
                            var actionName = ( !!action ? action : method ) + 'Action'
                              , roles = [];
                            
                            if ( typeof requiredRoles[ actionName ] !== 'undefined' ) {
                                if ( requiredRoles[ actionName ] !== null ) {
                                    if ( requiredRoles[ actionName ] instanceof Array ) {
                                        roles = roles.concat( requiredRoles[ actionName ] );
                                    } else {
                                        roles.push( requiredRoles[ actionName ] );
                                    }
                                }
                            } else if ( typeof requiredRoles.all !== 'undefined' ) {
                                if ( requiredRoles.all !== null ) {
                                    roles = requiredRoles.all instanceof Array ? requiredRoles.all : [ requiredRoles.all ];
                                }
                            }

                            callback( null, roles );
                        },

                        function userRoleHasPermission( roles, callback ) {
                            var hasRole = true;

                            if ( !!roles.length && !req.isAuthenticated() ) {
                                return callback( 'User is not authenticated!' );
                            }

                            roles.every( function( requiredRole ) {
                                if ( requiredRole !== 'requiresLogin' && _.findWhere( [].slice.call( user.role ), { name: requiredRole } ) === undefined ) {
                                    callback( 'Logged in user does not have ' + requiredRole + ' role.' );
                                    hasRole = false;
                                    return false;
                                }
                                return true;
                            });

                            if ( !!hasRole ) {
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
        postAction: function() {
            if ( this.req.query.AccountId !== undefined && this.req.query.AccountId != this.req.user.account.id ) {
                return this.send( 200, [] );
            }
            this.req.body.AccountId = this.req.user.account.id;

            return this._super.apply( this, arguments );
        },

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
        },
        
        assignAction: function () {
            var roleId = this.req.params.id
              , users = this.req.body.users
              , removed = this.req.body.removed;

            users = !users || !Array.isArray( users ) ? [] : users;
            removed = !removed || !Array.isArray( removed ) ? [] : removed;

            RoleService
                .listRolesWithPerm( accId, roleId )
                .then( function( role ) {
                    return [ role, RoleService.assignRole( accId, users, removed, role ) ];
                })
                .spread( function( role ) {
                    return RoleService.getRoleCounts( role, accId );
                })
                .then( this.proxy( 'handleServiceMessage' ) )
                .catch( this.proxy( 'handleException' ) );
        }

    });
}
