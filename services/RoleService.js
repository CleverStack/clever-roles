module.exports = function( Promise, Service, RoleModel, PermissionModel, UserModel ) {
    return Service.extend({

        model: RoleModel,

        create: function( data ) {
            var service = this
              , create  = this._super;

            return new Promise( function( resolve, reject ) {
                create.apply( service, [ {
                    name:        data.name,
                    description: data.description ? data.description : null,
                    AccountId:   data.AccountId ? data.AccountId : null
                }])
                .then( function( role ) {
                    return service.handlePermissions( role, data.permissions );
                })
                .then( function( role ) {
                    return service.handleUsers( role, data.users );
                })
                .then( resolve )
                .catch( reject );
            });
        },

        update: function( idOrWhere, data ) {
            var service = this
              , update  = this._super;

            return new Promise( function( resolve, reject ) {
                update.apply( service, [ idOrWhere, {
                    name:        data.name,
                    description: data.description ? data.description : null,
                    AccountId:   data.AccountId ? data.AccountId : null
                }])
                .then( function( role ) {
                    return service.handlePermissions( role, data.permissions );
                })
                .then( function( role ) {
                    return service.handleUsers( role, data.users );
                })
                .then( resolve )
                .catch( reject );
            });
        },

        handlePermissions: function( role, permIds ) {
            return new Promise( function( resolve, reject ) {
                if ( !permIds || !permIds.length ) {
                    return resolve( role );
                }

                PermissionModel
                .findAll({
                    where: {
                        id: {
                            in: permIds
                        }
                    }
                })
                .then( function( permissions ) {
                    role.setPermissions( permissions ).then( function() {
                        resolve( role );
                    })
                    .catch( reject );
                })
                .catch( reject );
            });
        },

        handleUsers: function( role, userIds ) {
            return new Promise( function( resolve, reject ) {
                if ( !userIds || !userIds.length ) {
                    return resolve( role );
                }

                UserModel
                .findAll({
                    where: {
                        id: {
                            in: userIds
                        }
                    }
                })
                .then( function( users ) {
                    role.setUsers( users ).then( function() {
                        resolve( role );
                    })
                    .catch( reject );
                })
                .catch( reject );
            });
        },

        hasRole: function ( req, roles ) {

            roles = Array.isArray ( roles )
                ? roles
                : [roles];

            var isAuthed = req.isAuthenticated () && !!req.user && !!req.user.role
              , hasRole = false;

            roles.forEach ( function ( role ) {
                if ( isAuthed && role === req.user.role.name ) {
                    hasRole = true;
                }
            } );

            return hasRole;
        }

    });
};
