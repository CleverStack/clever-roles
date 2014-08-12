module.exports = function ( Promise, Service, AccountModel, UserModel, RoleModel, sequelize, async ) {
    return Service.extend({
        model: AccountModel,

        create: function( data ) {
            var create  = this._super
              , trans   = null
              , account = null
              , user    = null;

            return new Promise( function( resolve, reject ) {
                async.waterfall(
                    [
                        function startTransaction( callback ) {
                            sequelize.transaction( function( _trans ) {
                                trans = _trans;
                                callback( null );
                            });
                        },

                        function createAccount( callback ) {
                            create({
                                name: data.company,
                                subdomain: data.subdomain,
                                emailForward: data.forward,
                                active: true
                            },
                            {
                                transaction: trans
                            })
                            .then( function( _account ) {
                                account = _account;
                                callback( null );
                            })
                            .catch( callback )
                        },

                        function generateDefaultRoles( callback ) {
                            RoleModel
                                .findAll({ AccountId: null })
                                .then( function( defaultRoles ) {
                                    console.dir(defaultRoles);
                                })
                                .catch( callback );
                        },

                        function createUser( callback ) {
                            UserModel.create(
                            {
                                title:          data.title || null,
                                username:       data.username || data.email,
                                email:          data.email,
                                firstname:      data.firstname,
                                lastname:       data.lastname,
                                password:       data.password,
                                phone:          data.phone || null,
                                active:         true,
                                confirmed:      true,
                                hasAdminRight:  true,
                                AccountId:      account.id
                            }, 
                            {
                                transaction: trans
                            })
                            .then( function( _user ) {
                                user = _user;
                                callback( null );
                            })
                            .catch( callback );
                        },

                        function addUserToAccount( callback ) {
                            account.setUser( user )
                                .then( function( _account ) {
                                    account = _account;
                                })
                                .catch( callback );
                        },

                        function endTransaction( callback ) {
                            trans.done( callback );
                        }
                    ],
                    function createComplete( err ) {
                        if ( err === null ) {
                            resolve( account );
                        } else {
                            reject( err );
                        }
                    }
                )
            });
        }
    });
}