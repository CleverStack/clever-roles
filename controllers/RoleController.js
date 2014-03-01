module.exports = function ( RoleService ) {

    return (require ( 'classes' ).Controller).extend (
        {
            service: RoleService
        },
        /* @Prototype */
        {

            listAction: function () {
                RoleService
                    .listRolesWithPerm ()
                    .then ( this.proxy ( 'handleServiceMessage' ) )
                    .fail ( this.proxy ( 'handleException' ) );
            },

            getAction: function () {
                var roleId = this.req.params.id;

                RoleService
                    .getRoleWithPerms ( roleId )
                    .then ( this.proxy ( 'handleServiceMessage' ) )
                    .fail ( this.proxy ( 'handleException' ) );

            },

            postAction: function () {
                var data = this.req.body;

                if ( data.id ) {
                    this.putAction ();
                    return;
                }

                RoleService
                    .createRoleWithPermissions ( data )
                    .then ( this.proxy ( 'handleServiceMessage' ) )
                    .fail ( this.proxy ( 'handleException' ) );
            },

            putAction: function () {
                var data = this.req.body
                  , roleId = this.req.params.id;

                if ( data.id != roleId ) {
                    return this.send ( "Unauthorized", 403 )
                }

                RoleService
                    .updateRoleWithPermissions ( data )
                    .then ( this.proxy ( 'handleServiceMessage' ) )
                    .fail ( this.proxy ( 'handleException' ) );

            },

            deleteAction: function () {
                var roleId = this.req.params.id;

                RoleService
                    .removeRoleWithPermissions ( roleId )
                    .then ( this.proxy ( 'handleServiceMessage' ) )
                    .fail ( this.proxy ( 'handleException' ) );
            },

            assignAction: function () {
                var roleId = this.req.params.id
                  , users = this.req.body.users
                  , removed = this.req.body.removed;

                users = !users || !Array.isArray ( users ) ? [] : users;
                removed = !removed || !Array.isArray ( removed ) ? [] : removed;

                RoleService
                    .listRolesWithPerm ( accId, roleId )
                    .then ( function ( role ) {
                        return [ role, RoleService.assignRole ( accId, users, removed, role ) ];
                    } )
                    .spread ( function ( role ) {
                        return RoleService.getRoleCounts ( role, accId );
                    } )
                    .then ( this.proxy ( 'handleServiceMessage' ) )
                    .fail ( this.proxy ( 'handleException' ) );
            },

            handleServiceMessage: function ( obj ) {

                if ( obj.statuscode ) {
                    this.send ( obj.message, obj.statuscode );
                    return;
                }

                this.send ( obj, 200 );
            }

        } );
}
