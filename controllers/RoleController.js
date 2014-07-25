module.exports = function ( Controller, RoleService, PermissionController ) {
    return Controller.extend(
    {
        service: RoleService,
        
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

        postAction: function () {
            this.req.body.AccountId = this.req.user.account.id;

            if ( this.req.body.id ) {
                return this.putAction();
            }

            var data = this.req.body;
            RoleService
                .createRoleWithPermissions( data )
                .then( this.proxy( 'handleServiceMessage' ) )
                .catch( this.proxy( 'handleException' ) );
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
