module.exports = ( require( 'classes' ).Module ).extend({
    preRoute: function() {
        var injector        = require( 'injector' )
          , AccountModel    = injector.getInstance( 'AccountModel' )
          , UserModel       = injector.getInstance( 'UserModel' )
          , RoleModel       = injector.getInstance( 'RoleModel' )
          , PermissionModel = injector.getInstance( 'PermissionModel' );

        // UserModel.on( 'preQuery', function( options ) {
        //     console.log( 'UserModel:preQuery()');
        //     if ( typeof options.include === 'undefined' ) {
        //         options.include = [];
        //     }
        //     if ( options.include.indexOf( RoleModel ) === -1 ) {
        //         options.include.push( RoleModel );
        //     }
        //     if ( options.include.indexOf( AccountModel ) === -1 ) {
        //         options.include.push( AccountModel );
        //     }
        // });

        // PermissionModel.on( 'preQuery', function( options ) {
        //     console.log( 'PermissionModel:preQuery()');
        //     // options.where.AccountId = 
        //     if ( typeof options.include === 'undefined' ) {
        //         options.include = [];
        //     }
        //     if ( options.include.indexOf( PermissionModel ) === -1 ) {
        //         options.include.push( PermissionModel );
        //     }
        //     if ( options.include.indexOf( AccountModel ) === -1 ) {
        //         options.include.push( AccountModel );
        //     }
        // });

        // AccountModel.on( 'preQuery', function( options ) {
        //     console.log( 'RoleModel:preQuery()');
        //     if ( typeof options.include === 'undefined' ) {
        //         options.include = [];
        //     }
        //     if ( options.include.indexOf( PermissionModel ) === -1 ) {
        //         options.include.push( PermissionModel );
        //     }
        //     if ( options.include.indexOf( RoleModel ) === -1 ) {
        //         options.include.push( RoleModel );
        //     }
        // });
    }
});