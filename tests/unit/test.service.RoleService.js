var expect = require( 'chai' ).expect
  , Q = require( 'q' )
  , testEnv = require( 'utils' ).testEnv()
  , roleId_0, roleId_1, roleId_2, roleId_3
  , permIds = [], roleIds = [], sysRoles = [], testUser;

var Service
  , Model
  , PermissionModel
  , UserModel;

describe( 'service.RoleService', function () {
    

    before( function( done ) {
        
        testEnv( function ( _RoleService_, _ORMRoleModel_, _ORMPermissionModel_, _ORMUserModel_ ) {
            
            Service = _RoleService_;
            Model = _ORMRoleModel_;
            PermissionModel = _ORMPermissionModel_;
            UserModel = _ORMUserModel_;

            var permissions = [
                {
                    action: 'test_view',
                    description: 'This is the test permissions for view'
                },
                {
                    action: 'test_save',
                    description: 'This is the test permissions for save'
                }
            ];

            var promise = [];

            permissions.forEach( function ( perm ) {
                promise.push( PermissionModel.create( perm ) );
            } );

            Q.all( promise ).then( function ( result ) {
                result.forEach( function ( res ) {
                    permIds.push( res.id );
                } );
                done();
            }, done );
        }, done );
    } );

    before( function ( done ) {
        var role = {
                name: 'Test Role'
            };

        Model
            .create ( role )
            .success ( function ( role ) {

                expect ( role ).to.be.an ( 'object' ).and.be.ok;
                expect ( role ).to.have.property ( 'id' ).and.be.ok;

                roleId_3 = role.id;

                done();
            })
            .error ( done );

    });

    before( function ( done ) {
        var systemRoles = [
                {
                    name: 'Super Admin'
                },
                {
                    name: 'General User'
                }
            ]
            , testuser = {
                username: 'Vasilij',
                email: 'vasil_clever@gmail.com',
                password: 'qqq',
                RoleId: roleId_3
            }
            , promise = [];

        systemRoles.forEach( function ( role ) {
            promise.push( Model.find( { where: role } ) );
        } );

        Q.all( promise ).then( function ( result ) {
            promise = [];
            result.forEach( function ( role, index ) {
                if ( !!role && !!role.id ) {
                    sysRoles.push( role );
                } else {
                    promise.push( Model.create( systemRoles[index] ) )
                }
            } );

            Q.all( promise ).then( function ( result ) {
                result.forEach( function ( role, index ) {
                    sysRoles.push( role );
                } );

                UserModel
                    .find( { where: { username: testuser.username } } )
                    .success( function ( user ) {
                        if ( !!user && !!user.id ) {

                            user.updateAttributes( { RoleId: roleId_3 } )
                                .success( function ( user ) {

                                    user = JSON.parse ( JSON.stringify ( user ) );

                                    expect( user ).to.be.an( 'object' );
                                    expect( user ).to.have.property( 'id' ).and.be.ok;
                                    expect( user ).to.have.property( 'username' ).and.equal ( testuser.username );
                                    expect( user ).to.have.property( 'email' ).and.equal ( testuser.email );
                                    expect( user ).to.have.property( 'RoleId' ).and.equal ( testuser.RoleId );

                                    testUser = user;
                                    done();
                                } )
                                .error( done );
                        } else {
                            UserModel.create( testuser )
                                .success( function ( user ) {

                                    user = JSON.parse ( JSON.stringify ( user ) );

                                    expect( user ).to.be.an( 'object' );
                                    expect( user ).to.have.property( 'id' ).and.be.ok;
                                    expect( user ).to.have.property( 'username' ).and.equal ( testuser.username );
                                    expect( user ).to.have.property( 'email' ).and.equal ( testuser.email );
                                    expect( user ).to.have.property( 'RoleId' ).and.equal ( testuser.RoleId );

                                    testUser = user;
                                    done();
                                } )
                                .error( done );
                        }
                    } )
                    .error( done );
            }, done );
        }, done );
    } );

    after( function( done ) {
        Model
            .destroy( roleId_0 )
            .success(function(){})
            .error( done );

        var sql_1 = 'delete from PermissionsRoles where RoleId = ' + roleId_0 + ' ;';
        var sql_2 = 'delete from PermissionsRoles where RoleId = ' + roleId_2 + ' ;';

        Q.all( [ Service.query( sql_1 ), Service.query( sql_2 ) ] );

        var promise = [];
        permIds.forEach( function ( permId ) {
            promise.push( PermissionModel.destroy( permId ) );
        } );

        Q.all( promise )
            .then( function() {
                done();
            })
            .fail( done );

    });

    describe( '.saveNewRole( data, accId )', function () {
        
        it( 'should be able to create a new role', function ( done ) {
            var role = {
                    name: 'Test_Role',
                    description: 'This is the test role'
                };

            Service
                .saveNewRole( role )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'id' );

                    roleId_0 = result.id;

                    Model.find( roleId_0 )
                        .success( function ( result ) {

                            expect( result ).to.be.an( 'object' );
                            expect( result ).to.have.property( 'id' );
                            expect( result ).to.have.property( 'name' ).and.equal( role.name );
                            expect( result ).to.have.property( 'description' ).and.equal( role.description );

                            done();
                        } )
                        .error( done );
                }, done );
        } );

    } );

    describe( '.saveRolePermissions( role, permIds )', function () {

        it( 'should not be able to create RolePermissions if permission array is empty', function ( done ) {

            Model
                .find( roleId_0 )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' );

                    Service
                        .saveRolePermissions( role, [] )
                        .then( function ( result ) {

                            expect( result ).to.be.an( 'object' );
                            expect( result ).to.have.property( 'id' ).and.equal( roleId_0 );
                            expect( result ).to.have.property( 'name' ).and.equal( 'Test_Role' );
                            expect( result ).to.have.property( 'description' ).and.equal( 'This is the test role' );
                            expect( result ).to.have.property( 'permissions' ).to.be.an( 'array' );
                            expect( result.permissions ).to.be.empty;

                            done();
                        }, done );
                } )
                .error( done );
        } );

        it( 'should be able to create RolePermissions', function ( done ) {

            Model.find( roleId_0 )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' );

                    Service.saveRolePermissions( role, permIds )
                        .then( function ( result ) {

                            expect( result ).to.be.an( 'object' );
                            expect( result ).to.have.property( 'id' ).and.equal( roleId_0 );
                            expect( result ).to.have.property( 'name' ).and.equal( 'Test_Role' );
                            expect( result ).to.have.property( 'description' ).and.equal( 'This is the test role' );
                            expect( result ).to.have.property( 'permissions' ).to.be.an( 'array' );
                            expect( result.permissions ).to.have.length( permIds.length );

                            role
                                .getPermissions()
                                .success( function ( result ) {

                                    expect( result ).to.be.an( 'array' );
                                    expect( result ).to.have.length( 2 );
                                    expect( result[0] ).to.be.an( 'object' );
                                    expect( result[0] ).to.have.property( 'id' );
                                    expect( result[0] ).to.have.property( 'action' );
                                    expect( result[0] ).to.have.property( 'description' );
                                    expect( result[0].id === permIds[0] || result[0].id === permIds[1] ).to.be.true;
                                    expect( result[1].id === permIds[0] || result[1].id === permIds[1] ).to.be.true;

                                done();
                            })

                        }, done );
                } )
                .error( done );
        } );
    } );

    describe( '.createRoleWithPermissions( data, accId )', function () {
        
        it( 'should be able to create a new role with permissions', function ( done ) {
            var data = {
                    name: 'Test_Role_1',
                    description: 'This is the test role #1',
                    permIds: permIds
                };

            Service.createRoleWithPermissions( data )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'id' );
                    expect( result ).to.have.property( 'name' ).and.equal( data.name );
                    expect( result ).to.have.property( 'description' ).and.equal( data.description );
                    expect( result ).to.have.property( 'permissions' ).to.be.an( 'array' );
                    expect( result.permissions ).to.have.length( data.permIds.length );

                    roleId_1 = result.id;

                    Model.find( result.id )
                        .success( function ( role ) {

                            expect( role ).to.be.an( 'object' );
                            expect( role ).to.have.property( 'id' );
                            expect( role ).to.have.property( 'name' ).and.equal( data.name );
                            expect( role ).to.have.property( 'description' ).and.equal( data.description );

                            role
                                .getPermissions()
                                .success( function ( result ) {

                                    expect( result ).to.be.an( 'array' );
                                    expect( result ).to.have.length( 2 );
                                    expect( result[0] ).to.be.an( 'object' );
                                    expect( result[0] ).to.have.property( 'id' );
                                    expect( result[0] ).to.have.property( 'action' );
                                    expect( result[0] ).to.have.property( 'description' );
                                    expect( result[0].id === data.permIds[0] || result[0].id === data.permIds[1] ).to.be.true;
                                    expect( result[1].id === data.permIds[0] || result[1].id === data.permIds[1] ).to.be.true;

                                    done();
                                })
                        } )
                        .error( done );
                }, done );
        } );

        it( 'should be able to create a new role without permissions', function ( done ) {
            var data = {
                    name: 'Test_Role_2',
                    description: 'This is the test role #2',
                    permIds: []
                };

            Service.createRoleWithPermissions( data )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'id' );
                    expect( result ).to.have.property( 'name' ).and.equal( data.name );
                    expect( result ).to.have.property( 'description' ).and.equal( data.description );
                    expect( result ).to.have.property( 'permissions' ).to.be.an( 'array' );
                    expect( result.permissions ).to.have.length( data.permIds.length );

                    roleId_2 = result.id;

                    Model.find( result.id )
                        .success( function ( role ) {

                            expect( role ).to.be.an( 'object' );
                            expect( role ).to.have.property( 'id' );
                            expect( role ).to.have.property( 'name' ).and.equal( data.name );
                            expect( role ).to.have.property( 'description' ).and.equal( data.description );

                            role
                                .getPermissions()
                                .success( function ( result ) {

                                    expect( result ).to.be.an( 'array' );
                                    expect( result ).to.be.empty;

                                    done();
                                })
                        } )
                        .error( done );
                }, done );
        } );

    } );

    describe( '.updateRole( role, data )', function () {

        it( 'should be able to update name at existing role', function ( done ) {
            var data = {
                    name: 'Test_Role_updated'
                };

            Model.find( roleId_0 )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' ).and.equal( roleId_0 );
                    expect( role ).to.have.property( 'name' ).and.equal( 'Test_Role' );
                    expect( role ).to.have.property( 'description' ).and.equal( 'This is the test role' );

                    Service
                        .updateRole( role, data )
                        .then( function( result ) {

                            expect( role ).to.be.an( 'object' );
                            expect( role ).to.have.property( 'id' ).and.equal( roleId_0 );
                            expect( role ).to.have.property( 'name' ).and.equal( data.name );
                            expect( role ).to.have.property( 'description' ).and.equal( 'This is the test role' );

                            done();
                        }, done);

                } )
                .error( done );
        } );

        it( 'should be able to update name and description at existing role', function ( done ) {
            var data = {
                name: 'Test_Role_updated second time',
                description: 'This is the test role updated'
            };

            Model.find( roleId_0 )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' ).and.equal( roleId_0 );
                    expect( role ).to.have.property( 'name' ).and.equal( 'Test_Role_updated' );
                    expect( role ).to.have.property( 'description' ).and.equal( 'This is the test role' );

                    Service
                        .updateRole( role, data )
                        .then( function( result ) {

                            expect( role ).to.be.an( 'object' );
                            expect( role ).to.have.property( 'id' ).and.equal( roleId_0 );
                            expect( role ).to.have.property( 'name' ).and.equal( data.name );
                            expect( role ).to.have.property( 'description' ).and.equal( data.description );

                            done();
                        }, done);

                } )
                .error( done );
        } );

    } );

    describe( '.updateRoleWithPermissions( data, accId )', function () {

        it( 'should be able to update a existing role with permissions', function ( done ) {
            var data = {
                    id: roleId_1,
                    name: 'Test_Role_1_updated',
                    description: 'This is the test role #1 updated',
                    permIds: []
                };

            Service.updateRoleWithPermissions( data )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'id' ).and.equal( roleId_1 );
                    expect( result ).to.have.property( 'name' ).and.equal( data.name );
                    expect( result ).to.have.property( 'description' ).and.equal( data.description );
                    expect( result ).to.have.property( 'permissions' ).to.be.an( 'array' );
                    expect( result.permissions ).to.be.empty;

                    Model.find( result.id )
                        .success( function ( role ) {

                            expect( role ).to.be.an( 'object' );
                            expect( role ).to.have.property( 'id' ).and.equal( roleId_1 );
                            expect( role ).to.have.property( 'name' ).and.equal( data.name );
                            expect( role ).to.have.property( 'description' ).and.equal( data.description );

                            role
                                .getPermissions()
                                .success( function ( result ) {

                                    expect( result ).to.be.an( 'array' );
                                    expect( result ).to.be.empty;

                                    done();
                                })
                        } )
                        .error( done );
                }, done );
        } );

        it( 'should be able to update a existing role with permissions', function ( done ) {
            var data = {
                    id: roleId_2,
                    name: 'Test_Role_2_updated',
                    description: 'This is the test role #2 updated',
                    permIds: permIds
                };

            Service.updateRoleWithPermissions( data )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'id' ).and.equal( roleId_2 );
                    expect( result ).to.have.property( 'name' ).and.equal( data.name );
                    expect( result ).to.have.property( 'description' ).and.equal( data.description );
                    expect( result ).to.have.property( 'permissions' ).to.be.an( 'array' );
                    expect( result.permissions ).to.have.length( data.permIds.length );

                    Model.find( result.id )
                        .success( function ( role ) {

                            expect( role ).to.be.an( 'object' );
                            expect( role ).to.have.property( 'id' ).and.equal( roleId_2 );
                            expect( role ).to.have.property( 'name' ).and.equal( data.name );
                            expect( role ).to.have.property( 'description' ).and.equal( data.description );

                            role
                                .getPermissions()
                                .success( function ( result ) {

                                    expect( result ).to.be.an( 'array' );
                                    expect( result ).to.have.length( data.permIds.length );
                                    expect( result[0] ).to.be.an( 'object' );
                                    expect( result[0] ).to.have.property( 'id' );
                                    expect( result[0] ).to.have.property( 'action' );
                                    expect( result[0] ).to.have.property( 'description' );
                                    expect( result[0].id === data.permIds[0] || result[0].id === data.permIds[1] ).to.be.true;
                                    expect( result[1].id === data.permIds[0] || result[1].id === data.permIds[1] ).to.be.true;

                                    done();
                                })
                        } )
                        .error( done );
                }, done );
        } );

    } );

    describe( '.listRolesWithPerm(  )', function () {

        it( 'should be able to get a list of roles with permission', function ( done ) {

            Service
                .listRolesWithPerm()
                .then( function ( result ) {

                    expect( result ).to.be.an( 'array' );
                    expect( result ).to.have.length.above( 0 );
                    expect( result[ result.length - 1 ] ).to.be.an( 'object' );
                    expect( result[ result.length - 1 ] ).to.contain.keys( 'id', 'name', 'description', 'permissions' );
                    expect( result[ result.length - 1 ].permissions ).to.be.an( 'array' );
                    expect( result[ result.length - 1 ].permissions[0] ).to.contain.keys( 'permId', 'action', 'description' );

                    done();
                }, done );
        } );

    } );

    describe( '.getRoleWithPerms( roleId )', function () {

        it( 'should be able to get role with permission by id', function ( done ) {

            Service
                .getRoleWithPerms( roleId_0 )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'array' );
                    expect( result ).to.have.length ( 1 );
                    expect( result[ 0 ] ).to.be.an( 'object' );
                    expect( result[ 0 ] ).to.contain.keys( 'id', 'name', 'description', 'permissions' );
                    expect( result[ 0 ].permissions ).to.be.an( 'array' );
                    expect( result[ 0 ].permissions[0] ).to.contain.keys( 'permId', 'action', 'description' );

                    done();
                }, done );
        } );

    } );

    describe( '.assignRole( userIds, removed, role )', function () {
        
        it( 'should be able to get a statuscode 404 if insufficient data', function ( done ) {
            var userIds = []
              , removed = [];

            Service.assignRole( userIds, removed )
                .then( function ( result ) {

                    expect( result ).to.be.an( 'object' );
                    expect( result ).to.have.property( 'statuscode' ).and.equal( 404 );
                    expect( result ).to.have.property( 'message' );

                    done();
                }, done );
        } );

        it( 'should be able to assign null role for user', function ( done ) {
            var roleId = roleId_3
              , userIds = []
              , removed = [ testUser.id ];

            Model.find( roleId )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' ).and.equal( roleId );
                    expect( role ).to.have.property( 'name' );

                    Service
                        .assignRole( userIds, removed, role )
                        .then( function ( result ) {

                            UserModel
                                .find( testUser.id )
                                .success( function ( user ) {

                                    user = JSON.parse ( JSON.stringify ( user ) );
                                    
                                    expect( user ).to.be.an( 'object' );
                                    expect( user ).to.contain.keys( 'id', 'username', 'email', 'RoleId' );
                                    expect( user.id ).to.equal( testUser.id );
                                    expect( user.RoleId ).to.be.null;

                                    done();
                                } )
                                .error( done );
                        }, done );
                } )
                .error( done );
        } );

        it( 'should be able to assign role for user', function ( done ) {
            var roleId = roleId_2
                , userIds = [ testUser.id ]
                , removed = [];

            Model.find( roleId )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' ).and.equal( roleId );
                    expect( role ).to.have.property( 'name' );

                    Service.assignRole( userIds, removed, role )
                        .then( function ( result ) {

                            UserModel
                                .find( testUser.id )
                                .success( function ( user ) {

                                    user = JSON.parse ( JSON.stringify ( user ) );

                                    expect( user ).to.be.an( 'object' );
                                    expect( user ).to.contain.keys( 'id', 'username', 'email', 'RoleId' );
                                    expect( user.id ).to.equal( testUser.id );
                                    expect( user.RoleId ).to.equal( roleId_2 );

                                    done();
                                } )
                                .error( done );
                        }, done );
                } )
                .error( done );
        } );

        it( 'should be able to assign null role for all user', function ( done ) {
            var roleId = roleId_2
              , userIds = []
              , removed = [];

            Model.find( roleId )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' ).and.equal( roleId );
                    expect( role ).to.have.property( 'name' );

                    Service
                        .assignRole( userIds, removed, role )
                        .then( function ( result ) {

                            UserModel
                                .find( testUser.id )
                                .success( function ( user ) {

                                    user = JSON.parse ( JSON.stringify ( user ) );

                                    expect( user ).to.be.an( 'object' );
                                    expect( user ).to.contain.keys( 'id', 'username', 'email', 'RoleId' );
                                    expect( user.id ).to.equal( testUser.id );
                                    expect( user.RoleId ).to.be.null;

                                    done();
                                } )
                                .error( done );
                        }, done );
                } )
                .error( done );
        } );

    } );

    describe( '.removeRole( role )', function () {

        before( function ( done ) {
            var roleId = roleId_2
              , userIds = [ testUser.id ]
              , removed = [];

            Model.find( roleId )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' ).and.equal( roleId );
                    expect( role ).to.have.property( 'name' );

                    Service.assignRole( userIds, removed, role )
                        .then( function ( result ) {

                            UserModel
                                .find( testUser.id )
                                .success( function ( user ) {

                                    user = JSON.parse ( JSON.stringify ( user ) );

                                    expect( user ).to.be.an( 'object' );
                                    expect( user ).to.contain.keys( 'id', 'username', 'email', 'RoleId' );
                                    expect( user.id ).to.equal( testUser.id );
                                    expect( user.RoleId ).to.equal( roleId_2 );

                                    done();
                                } )
                                .error( done );
                        }, done );
                } )
                .error( done );
        } );

        it( 'should not be able to delete system role', function ( done ) {

            Model
                .find( sysRoles[0].id )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' );
                    expect( role ).to.have.property( 'name' ).and.equal( sysRoles[0].name );

                    Service.removeRole( role )
                        .then( function ( result ) {

                            expect( result ).to.be.an( 'object' );
                            expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                            expect( result ).to.have.property( 'message' );

                            Model.find( sysRoles[0].id )
                                .success( function ( role ) {

                                    expect( role ).to.be.an( 'object' );
                                    expect( role ).to.have.property( 'id' ).and.equal( sysRoles[0].id );
                                    expect( role ).to.have.property( 'name' ).and.equal( sysRoles[0].name );

                                    done();
                                } )
                                .error( done );
                        }, done );
                } )
                .error( done );
        } );

        it( 'should be able to delete role', function ( done ) {

            Model.find( roleId_2 )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' ).and.equal( roleId_2 );
                    expect( role ).to.have.property( 'name' );

                    Service.removeRole( role )
                        .then( function () {

                            Model.find( roleId_2 )
                                .success( function ( role ) {

                                    expect( role ).to.not.be.ok;

                                    UserModel
                                        .find( testUser.id )
                                        .success( function ( user ) {

                                            user = JSON.parse ( JSON.stringify ( user ) );

                                            expect( user ).to.be.an( 'object' );
                                            expect( user ).to.contain.keys( 'id', 'username', 'email', 'RoleId' );
                                            expect( user.id ).to.equal( testUser.id );
                                            expect( user.RoleId ).to.not.equal( roleId_2 );

                                            done();
                                        } )
                                        .error( done );
                                } )
                                .error( done );
                        }, done );
                } )
                .error( done );
        } );
    } );

    describe( '.removeRoleWithPermissions( id )', function () {

        it( 'should not be able to delete system role', function ( done ) {

            Model
                .find( sysRoles[0].id )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' );
                    expect( role ).to.have.property( 'name' ).and.equal( sysRoles[0].name );

                    Service.removeRoleWithPermissions( role.id )
                        .then( function ( result ) {

                            expect( result ).to.be.an( 'object' );
                            expect( result ).to.have.property( 'statuscode' ).and.equal( 403 );
                            expect( result ).to.have.property( 'message' );

                            Model.find( sysRoles[0].id )
                                .success( function ( role ) {

                                    expect( role ).to.be.an( 'object' );
                                    expect( role ).to.have.property( 'id' ).and.equal( sysRoles[0].id );
                                    expect( role ).to.have.property( 'name' ).and.equal( sysRoles[0].name );

                                    done();
                                } )
                                .error( done );
                        }, done );
                } )
                .error( done );
        } );

        it( 'should be able to delete role with permissions', function ( done ) {

            Model.find( roleId_1 )
                .success( function ( role ) {

                    expect( role ).to.be.an( 'object' );
                    expect( role ).to.have.property( 'id' ).and.equal( roleId_1 );
                    expect( role ).to.have.property( 'name' );

                    Service.removeRoleWithPermissions( role.id )
                        .then( function ( result ) {

                            expect( result ).to.be.an( 'object' );
                            expect( result ).to.have.property( 'statuscode' ).and.equal( 200 );
                            expect( result ).to.have.property( 'message' );

                            Model.find( roleId_1 )
                                .success( function ( role ) {

                                    expect( role ).to.not.be.ok;

                                    done();
                                } )
                                .error( done );
                        }, done );
                } )
                .error( done );
        } );
    } );

    describe( '.hasRole( req, roles )', function () {
        it( 'should be able to get true if user is authenticated and have the role', function ( done ) {
            var roles = ['Recruiter', 'General User']
              , req = {
                    isAuthenticated: function () { return true },
                    user: {
                        id: 10000,
                        firstname: 'Ivan',
                        role: {
                            id: 2000,
                            name: 'General User'
                        }
                    }
                };

            expect( req.isAuthenticated() ).to.be.true;
            expect( req ).to.have.property( 'user' ).and.have.property( 'role' );
            expect( Service.hasRole( req, roles ) ).to.be.true;

            done();

        } );

        it( 'should be able to get false if user is authenticated and do not have the role', function ( done ) {
            var roles = ['Recruiter', 'General User']
              , req = {
                    isAuthenticated: function () { return true },
                    user: {
                        id: 10000,
                        firstname: 'Ivan',
                        role: {
                            id: 2000,
                            name: 'Test Role'
                        }
                    }
                };

            expect( req.isAuthenticated() ).to.be.true;
            expect( req ).to.have.property( 'user' ).and.have.property( 'role' );
            expect( Service.hasRole( req, roles ) ).to.be.false;

            done();
        } );

        it( 'should be able to get false if user is not authenticated', function ( done ) {
            var roles = ['Recruiter', 'General User']
              , req = {
                    isAuthenticated: function () { return false },
                    user: {}
                };

            expect( req.isAuthenticated() ).to.be.false;
            expect( req ).to.have.property( 'user' );
            expect( Service.hasRole( req, roles ) ).to.be.false;

            done();
        } );
    } );
} );
