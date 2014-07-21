module.exports = ( require( 'classes' ).Module ).extend({
    preRoute: function() {
        var injector        = require( 'injector' )
          , UserModel       = injector.getInstance( 'UserModel' )
          , RoleModel       = injector.getInstance( 'RoleModel' )
          , PermissionModel = injector.getInstance( 'PermissionModel' );

        UserModel.on( 'preQuery', function( options ) {
            console.log( 'UserModel:preQuery()');
            if ( typeof options.include === 'undefined' ) {
                options.include = [];
            }
            if ( options.include.indexOf( RoleModel._model ) === -1 ) {
                options.include.push( RoleModel._model );
            }
        });

        RoleModel.on( 'preQuery', function( options ) {
            console.log( 'RoleModel:preQuery()');
            if ( typeof options.include === 'undefined' ) {
                options.include = [];
            }
            if ( options.include.indexOf( PermissionModel._model ) === -1 ) {
                options.include.push( PermissionModel._model );
            }
        });
    }
});