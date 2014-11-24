module.exports = require( 'classes' ).Module.extend({
    preRoute: function( AccountModel, RoleModel, PermissionModel, UserModel ) {
        // Include the users role and it's permissions
        UserModel.on( 'preQuery', function( options ) {
            options.include = typeof options.include !== 'undefined' ? options.include : [];
            if ( options.include.indexOf( { model: RoleModel._model } ) === -1 ) {
                options.include.push( { model: RoleModel._model, include: [ PermissionModel._model ] } );
            }
        });

        // Include the accounts roles and permissions
        AccountModel.on( 'preQuery', function( options ) {
            options.include = typeof options.include !== 'undefined' ? options.include : [];
            if ( options.include.indexOf( { model: RoleModel._model } ) === -1 ) {
                options.include.push( { model: RoleModel._model } );
            }
            if ( options.include.indexOf( { model: PermissionModel._model } ) === -1 ) {
                options.include.push( { model: PermissionModel._model } );
            }
        });

        // Include the roles permissions
        RoleModel.on( 'preQuery', function( options ) {
            options.include = typeof options.include !== 'undefined' ? options.include : [];
            if ( options.include.indexOf( { model: PermissionModel._model } ) === -1 ) {
                options.include.push( { model: PermissionModel._model } );
            }

            if ( options.include.indexOf( { model: UserModel._model } ) === -1 ) {
                options.include.push( { model: UserModel._model } );
            }
        });

        PermissionModel.on( 'preQuery', function( options ) {
            options.include = typeof options.include !== 'undefined' ? options.include : [];
            if ( options.include.indexOf( { model: RoleModel._model } ) === -1 ) {
                options.include.push( { model: RoleModel._model } );
            }
        });
    }
});
