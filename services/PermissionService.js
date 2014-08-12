module.exports = function( Promise, Service, PermissionModel, RoleModel ) {
    return Service.extend({
        
        model: PermissionModel,

        create: function( data ) {
            var service = this
              , create  = this._super;

            return new Promise( function( resolve, reject ) {
                create.apply( service, [ {
                    action:      data.action,
                    description: data.description   ? data.description : null,
                    AccountId:   data.AccountId     ? data.AccountId : null
                }])
                .then( function( permission ) {
                    return service.handleRoles( permission, data.roles );
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
                    action:      data.action,
                    description: data.description   ? data.description : null,
                    AccountId:   data.AccountId     ? data.AccountId : null
                }])
                .then( function( permission ) {
                    return service.handleRoles( permission, data.roles );
                })
                .then( resolve )
                .catch( reject );
            });
        },

        handleRoles: function( permission, roleIds ) {
            return new Promise( function( resolve, reject ) {
                if ( !roleIds || !roleIds.length ) {
                    return resolve( permission );
                }

                RoleModel
                .findAll({
                    where: {
                        id: {
                            in: roleIds
                        }
                    }
                })
                .then( function( roles ) {
                    permission.setRoles( roles ).then( function() {
                        resolve( permission );
                    })
                    .catch( reject );
                })
                .catch( reject );
            });
        }
    });
}