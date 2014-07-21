var RoleService     = null
  , configSysRoles  = require ( 'config' )[ 'clever-roles' ][ 'clever-system-role' ]
  , Promise         = require( 'bluebird' )
  , _               = require ( 'lodash' );

module.exports = function ( Service, RoleModel, PermissionModel ) {
    return Service.extend({
        model: RoleModel,

        listRolesWithPerm: function() {
            return RoleModel
                .findAll({
                    include: [ PermissionModel._model ]
                })
                .then( this.getRoleCounts );
        },

        getRoleWithPerms: function ( roleId ) {
            return RoleModel
                .findOne({
                    where: { id: roleId },
                    include: [ PermissionModel._model ]
                });
        },
        
        // getRoleCounts: function ( roles ) {
        //     var deferred = Promise.defer ()
        //       , service = this
        //       , roles = Array.isArray ( roles ) ? roles : [ roles ]
        //       , _where = { RoleId: _.uniq ( roles.map ( function ( r ) { return r.id; } ) ) };

        //     ORMUserModel
        //         .all ( { attributes: [ 'RoleId', ['count( id )', 'count']], where: _where, group: 'RoleId'} )
        //         .success ( function ( counts ) {

        //             if ( !counts || !counts.length ) {
        //                 return deferred.resolve ( service.groupRolePermissions ( roles ) );
        //             }

        //             var _roles = service.groupRolePermissions ( roles );

        //             counts.forEach ( function ( c ) {
        //                 c = JSON.parse ( JSON.stringify ( c ) );
        //                 var idx = _.findIndex ( _roles, function ( r ) {
        //                     return r.id === c.RoleId;
        //                 } );

        //                 _roles[ idx ].count = idx > -1 ? c.count : 0;
        //             } );

        //             deferred.resolve ( _roles );
        //         } )
        //         .error ( deferred.reject );

        //     return deferred.promise;
        // },

        assignRole: function ( userIds, removed, role ) {
            var deferred = Promise.defer ()
              , promise = []
              , _set = {}
              , _where = {};

            role = Array.isArray ( role )
                ? role[0]
                : role;

            if ( !role || !role.id ) {
                deferred.resolve ( {statuscode: 404, message: 'Role not found.'} );
            } else {
                if ( !userIds || !Array.isArray ( userIds ) || !userIds.length ) {
                    _set = {RoleId: null};
                    _where = {RoleId: role.id};
                } else if ( Array.isArray ( removed ) && removed.length ) {
                    _set = {RoleId: null};
                    _where = { id: removed, RoleId: role.id};
                } else {
                    _set = { RoleId: role.id };
                    _where = { id: userIds };
                }

                ORMUserModel
                    .findAll ( {where: _where } )
                    .success ( function ( users ) {

                        if ( !!users && !!users.length ) {
                            users.forEach ( function ( user ) {
                                promise.push ( user.updateAttributes ( _set ) )
                            } );

                            Q.all ( promise )
                                .then ( deferred.resolve )
                                .fail ( deferred.reject );

                        } else {
                            deferred.resolve ();
                        }
                    } )
                    .error ( deferred.reject );
            }

            return deferred.promise;
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
        },

        createRoleWithPermissions: function ( data ) {
            var deferred = Promise.defer ()
              , service = this;

            service
                .saveNewRole ( data )
                .then ( function ( role ) {
                    return service.saveRolePermissions ( role, data.permIds );
                } )
                .then ( deferred.resolve )
                .fail ( deferred.reject );

            return deferred.promise;
        },

        saveNewRole: function ( data ) {
            var deferred = Promise.defer ();

            var roledata = {
                name: data.name,
                description: ( data.description ) ? data.description : null
            };

            ORMRoleModel
                .create ( roledata )
                .success ( deferred.resolve )
                .error ( deferred.reject );

            return deferred.promise;
        },

        saveRolePermissions: function ( role, permIds ) {
            var deferred = Promise.defer ()
              , permissions = [];

            if ( !permIds || !permIds.length ) {
                deferred.resolve ( {
                    id: role.id,
                    name: role.name,
                    description: role.description,
                    permissions: permissions
                } );

            } else {
                permissions = permIds.map ( function ( p ) {
                    return ORMPermissionModel.build ( { id: p } )
                } );

                role
                    .setPermissions ( permissions )
                    .success ( function ( savedperms ) {
                        deferred.resolve ( {
                            id: role.id,
                            name: role.name,
                            description: role.description,
                            permissions: savedperms.map ( function ( x ) {
                                return x.id
                            } )
                        } );

                    } )
                    .error ( deferred.reject );
            }

            return deferred.promise;
        },

        updateRoleWithPermissions: function ( data ) {
            var deferred = Promise.defer ()
              , service = this;


            ORMRoleModel.find ( data.id )
                .success ( function ( role ) {
                    service
                        .updateRole ( role, data )
                        .then ( service.removePermissions.bind ( service ) )
                        .then ( function ( updatedrole ) {
                            return service.saveRolePermissions ( updatedrole, data.permIds );
                        } )
                        .then ( deferred.resolve )
                        .fail ( deferred.reject );
                } )
                .error ( deferred.reject );

            return deferred.promise;
        },

        updateRole: function ( role, data ) {
            var deferred = Promise.defer ()
              , roleData = {
                    name: data.name
                };

            if ( !!data.description ) {
                roleData.description = data.description;
            }

            role
                .updateAttributes ( roleData )
                .success ( deferred.resolve )
                .error ( deferred.reject );

            return deferred.promise;
        },

        removeRoleWithPermissions: function ( id ) {
            var deferred = Promise.defer ()
              , service = this;

            ORMRoleModel
                .find ( id )
                .success ( function ( role ) {

                    if ( !role ) {
                        return deferred.resolve ( { statuscode: 403, message: "unauthorized" } );
                    }

                    service
                        .removeRole ( role )
                        .then ( function ( status ) {
                            if ( !!status && !!status.statuscode ) {
                                return deferred.resolve ( status );
                            }

                            service
                                .removePermissions ( role )
                                .then ( function () {
                                    deferred.resolve ( {statuscode: 200, message: 'role has been removed'} );
                                }, deferred.reject );
                        } )
                        .fail ( deferred.reject );
                } )
                .error ( deferred.reject );

            return deferred.promise;
        },

        removeRole: function ( role ) {
            var deferred = Promise.defer ()
              , roleId = role.id
              , service = this
              , systemRoles = configSysRoles
              , defaultRole = systemRoles[ systemRoles.length - 1 ]
              , promise = [];

            if ( systemRoles.indexOf ( role.name ) >= 0 ) {
                deferred.resolve ( {statuscode: 403, message: 'unauthorized' } );
            } else {
                role.destroy ()
                    .success ( function () {
                        ORMRoleModel
                            .find ( { where: { name: defaultRole } } )
                            .success ( function ( defRole ) {
                                ORMUserModel
                                    .findAll ( { where: { RoleId: role.id } } )
                                    .success ( function ( users ) {

                                        if ( users && users.length ) {
                                            users.forEach ( function ( user ) {
                                                promise.push ( user.updateAttributes ( { RoleId: defRole.id } ) )
                                            } );

                                            Q.all ( promise )
                                                .then ( deferred.resolve )
                                                .fail ( deferred.reject );

                                        } else {
                                            deferred.resolve ();
                                        }
                                    } )
                                    .error ( deferred.reject );
                            } )
                            .error ( deferred.reject );

                    } )
                    .error ( deferred.reject );
            }

            return deferred.promise;
        },

        removePermissions: function ( role ) {
            var deferred = Promise.defer ()
              , sql = 'delete from PermissionsRoles where RoleId = ' + role.id + ' ;';

            this.query ( sql )
                .success ( function ( result ) {
                    role
                        .setPermissions ( [] )
                        .success ( function ( perms ) {
                            deferred.resolve ( role );
                        } )
                        .error ( deferred.reject );
                } )
                .error ( deferred.reject );

            return deferred.promise;
        },

        groupRolePermissions: function ( roles ) {
            var arr = []
              , grp = {};

            while ( i = roles.pop () ) {
                if ( !grp[ i.id ] ) {
                    grp[ i.id ] = {
                        id: i.id,
                        "name": i.name,
                        "description": i.description,
                        "permissions": []
                    }
                }

                if ( i.permid && i.action ) {
                    grp[ i.id ].permissions.push ( { permId: i.permid, action: i.action, description: i.perm_description } );
                }
            }

            Object.keys ( grp ).forEach ( function ( key ) {
                arr.push ( grp[key] );
            } );

            return arr;
        }

    });
};