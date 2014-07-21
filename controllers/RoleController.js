module.exports = function ( Controller, RoleService, PermissionService, PermissionController ) {
    return Controller.extend(
    {
        autoRouting: [
            PermissionController.requiresPermission({
                all: 'Role.$action'
            })
        ],

        requiresRole: function( role ) {
            return function( req, res, next ) {
                next();
            }
        }
    },
    {
        service: PermissionService,

        listAction: function () {
            RoleService
                .listRolesWithPerm()
                .then( this.proxy( 'handleServiceMessage' ) )
                .catch( this.proxy( 'handleException' ) );
        },

        getAction: function () {
            RoleService
                .getRoleWithPerms( this.req.params.id )
                .then( this.proxy( 'handleServiceMessage' ) )
                .catch( this.proxy( 'handleException' ) );

        },

        postAction: function () {
            var data = this.req.body;

            if ( data.id ) {
                return this.putAction();
            }

            RoleService
                .createRoleWithPermissions( data )
                .then( this.proxy( 'handleServiceMessage' ) )
                .catch( this.proxy( 'handleException' ) );
        },

        putAction: function () {
            var data = this.req.body
              , roleId = this.req.params.id;

            if ( data.id != roleId ) {
                return this.send( "Unauthorized", 403 )
            }

            RoleService
                .updateRoleWithPermissions( data )
                .then( this.proxy( 'handleServiceMessage' ) )
                .catch( this.proxy( 'handleException' ) );

        },

        deleteAction: function () {
            RoleService
                .removeRoleWithPermissions( this.req.params.id )
                .then( this.proxy( 'handleServiceMessage' ) )
                .catch( this.proxy( 'handleException' ) );
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