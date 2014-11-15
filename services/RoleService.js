module.exports = function( Promise, Service, RoleModel, PermissionService, UserService ) {
    return Service.extend({

        model: RoleModel,

        create: function( data, options ) {
            var service = this
              , create  = this._super;

            options = options || {};
            
            return new Promise( function( resolve, reject ) {
                create.apply( service, [ {
                    name:        data.name,
                    description: data.description ? data.description : null,
                    AccountId:   data.AccountId ? data.AccountId : null
                }, options ])
                .then( function( role ) {
                    return service.handlePermissions( role, data.Permissions, options );
                })
                .then( function( role ) {
                    return service.handleUsers( role, data.users, options );
                })
                .then( resolve )
                .catch( reject );
            });
        },

        update: function( idOrWhere, data, options ) {
            var service = this
              , update  = this._super;

            options = options || {};

            return new Promise( function( resolve, reject ) {
                update.apply( service, [ idOrWhere, {
                    name:        data.name,
                    description: data.description ? data.description : null,
                    AccountId:   data.AccountId ? data.AccountId : null
                }, options ])
                .then( function( role ) {
                    return service.handlePermissions( role, data.Permissions, options );
                })
                .then( function( role ) {
                    return service.handleUsers( role, data.users, options );
                })
                .then( resolve )
                .catch( reject );
            });
        },

        handlePermissions: function( role, permIds, options ) {
            return new Promise( function( resolve, reject ) {
                if ( !permIds || !permIds.length ) {
                    return resolve( role );
                }

                PermissionService
                    .findAll({
                        where: {
                            id: {
                                in: permIds
                            }
                        }
                    }, options )
                    .then( function( permissions ) {
                        role.setPermissions( permissions, options ).then( function() {
                            resolve( role );
                        })
                        .catch( reject );
                    })
                    .catch( reject );
            });
        },

        handleUsers: function( role, userIds, options ) {
            return new Promise( function( resolve, reject ) {
                if ( !userIds || !userIds.length ) {
                    return resolve( role );
                }

                UserService
                    .findAll({
                        where: {
                            id: {
                                in: userIds
                            }
                        }
                    }, options )
                    .then( function( users ) {
                        role.setUsers( users, options ).then( function() {
                            resolve( role );
                        })
                        .catch( reject );
                    })
                    .catch( reject );
            });
        },

        hasRole: function ( req, roles ) {
            roles = Array.isArray ( roles ) ? roles : [roles];

            var isAuthed = req.isAuthenticated () && !!req.user && !!req.user.Role
              , hasRole = false;

            roles.forEach ( function ( role ) {
                if ( isAuthed && role === req.user.Role.name ) {
                    hasRole = true;
                }
            } );

            return hasRole;
        }

    });
};
