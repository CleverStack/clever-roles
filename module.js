module.exports = require( 'classes' ).Module.extend({
    preRoute: function() {
        require( 'injector' ).inject( function( AccountModel, UserModel, RoleModel, PermissionModel, SubscriptionModel ) {
            UserModel.on( 'preQuery', function( options ) {
                UserModel.debug( 'UserModel:preQuery(include:[])' );
                if ( typeof options.include === 'undefined' ) {
                    options.include = [];
                }
                if ( options.include.indexOf( RoleModel ) === -1 ) {
                    options.include.push( RoleModel );
                }
                if ( options.include.indexOf( AccountModel ) === -1 ) {
                    options.include.push( AccountModel );
                }
            });

            AccountModel.on( 'preQuery', function( options ) {
                AccountModel.debug( 'AccountModel:preQuery(include:[])' );
                if ( typeof options.include === 'undefined' ) {
                    options.include = [];
                }
                if ( options.include.indexOf( RoleModel ) === -1 ) {
                    options.include.push( RoleModel );
                }
                if ( options.include.indexOf( SubscriptionModel ) === -1 ) {
                    options.include.push( SubscriptionModel );
                }
                if ( options.include.indexOf( PermissionModel ) === -1 ) {
                    options.include.push( PermissionModel );
                }
            });
        });
    }
});