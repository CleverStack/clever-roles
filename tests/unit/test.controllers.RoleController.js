var expect = require( 'chai' ).expect
  , testEnv = require( 'utils' ).testEnv()
  , seedData = require( 'seedData' )[ 'RoleModel' ]
  , Q = require( 'q' );

var Controller
  , Service
  , Model
  , PermissionModel
  , UserModel
  , permIds = []
  , roleId_0
  , roleId_1
  , testUser;

describe ( 'controllers.RoleController', function () {

    before( function ( done ) {
        testEnv( function ( _RoleController_, _RoleService_, _ORMRoleModel_, _ORMPermissionModel_, _ORMUserModel_ ) {
            var req = {
                params: { action: 'fakeAction'},
                method: 'GET',
                query: {}
            };

            var res = {
                json: function () {}
            };

            var next = function () {};

            Controller = _RoleController_;
            Service = _RoleService_;
            Model = _ORMRoleModel_;
            PermissionModel = _ORMPermissionModel_;
            UserModel = _ORMUserModel_;

            ctrl = new Controller( req, res, next );

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
        });
    } );

    before( function ( done ) {
        Model
            .bulkCreate ( seedData )
            .success ( function () {
                done();
            })
            .error ( done );
    } );

    afterEach( function ( done ) {

        ctrl.req = {
            params: { action: 'fakeAction'},
            method: 'GET',
            query: {},
            body: {}
        };

        ctrl.res = {
            json: function () {}
        };

        done();
    });

    describe('.postAction()', function() {

        it('should allow us to create role with permissions', function ( done ) {
            var data = {
                name: 'Test_Role_0',
                description: 'This is the test role #0',
                permIds: permIds
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' );
                expect( result ).to.have.property( 'id' ).and.be.ok;
                expect( result ).to.have.property( 'name' ).and.equal( data.name );
                expect( result ).to.have.property( 'description' ).and.equal( data.description );
                expect( result ).to.have.property( 'permissions' ).to.be.an( 'array' );
                expect( result.permissions ).to.have.length( data.permIds.length );

                roleId_0 = result.id;
                done();
            };

            ctrl.req.body = data;

            ctrl.postAction();
        });

        it('should allow us to create role without permissions', function ( done ) {
            var data = {
                name: 'Test_Role_1',
                description: 'This is the test role #1',
                permIds: []
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' );
                expect( result ).to.have.property( 'id' ).and.be.ok;
                expect( result ).to.have.property( 'name' ).and.equal( data.name );
                expect( result ).to.have.property( 'description' ).and.equal( data.description );
                expect( result ).to.have.property( 'permissions' ).to.be.an( 'array' );
                expect( result.permissions ).to.have.length( 0 );

                roleId_1 = result.id;
                done();
            };

            ctrl.req.body = data;

            ctrl.postAction();
        });
    });

    describe('.putAction()', function() {

        it('should allow us to update role with permissions', function ( done ) {
            var data = {
                id: roleId_0,
                name: 'Test_Role_0 updated',
                description: 'This is the test role #0 updated',
                permIds: permIds
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' );
                expect( result ).to.have.property( 'id' ).and.equal( roleId_0 );
                expect( result ).to.have.property( 'name' ).and.equal( data.name );
                expect( result ).to.have.property( 'description' ).and.equal( data.description );
                expect( result ).to.have.property( 'permissions' ).to.be.an( 'array' );
                expect( result.permissions ).to.have.length( data.permIds.length );

                roleId_0 = result.id;

                done();
            };

            ctrl.req.body = data;
            ctrl.req.params.id = roleId_0;

            ctrl.putAction();
        });

        it('should allow us to update role without permissions', function ( done ) {
            var data = {
                id: roleId_1,
                name: 'Test_Role_1 updated',
                description: 'This is the test role #1 updated',
                permIds: permIds
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'object' );
                expect( result ).to.have.property( 'id' ).and.equal( roleId_1 );
                expect( result ).to.have.property( 'name' ).and.equal( data.name );
                expect( result ).to.have.property( 'description' ).and.equal( data.description );
                expect( result ).to.have.property( 'permissions' ).to.be.an( 'array' );
                expect( result.permissions ).to.have.length( data.permIds.length );

                roleId_0 = result.id;

                done();
            };

            ctrl.req.body = data;
            ctrl.req.params.id = roleId_1;

            ctrl.putAction();
        });

        it('should not allow us to update role if rolId do not coincide', function ( done ) {
            var data = {
                id: roleId_1 + 1,
                name: 'Test_Role_1 updated',
                description: 'This is the test role #1 updated',
                permIds: permIds
            };

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 403 );

                expect( result ).to.be.an( 'string' ).and.equal ( 'Unauthorized' );

                done();
            };

            ctrl.req.body = data;
            ctrl.req.params.id = roleId_1;

            ctrl.putAction();
        });
    });

    describe('.listAction()', function() {

        before( function ( done ) {
            var testuser = {
                    username: 'Vasilij',
                    email: 'vasil_clever@gmail.com',
                    password: 'qqq',
                    RoleId: roleId_0
                };

            UserModel
                .find( { where: { username: testuser.username } } )
                .success( function ( user ) {
                    if ( !!user && !!user.id ) {

                        user.updateAttributes( { RoleId: roleId_0 } )
                            .success( function ( user ) {

                                expect( user ).to.be.an( 'object' );
                                expect( user ).to.have.property ( 'id' ).and.be.ok;
                                expect( user ).to.have.property ( 'username' ).and.equal ( testuser.username );
                                expect( user ).to.have.property ( 'email' ).and.equal ( testuser.email );
                                expect( user ).to.have.property ( 'RoleId' ).and.equal ( testuser.RoleId );

                                testUser = user;
                                done();
                            } )
                            .error( done );
                    } else {
                        UserModel.create( testuser )
                            .success( function ( user ) {

                                expect( user ).to.be.an( 'object' );
                                expect( user ).to.have.property ( 'id' ).and.be.ok;
                                expect( user ).to.have.property ( 'username' ).and.equal ( testuser.username );
                                expect( user ).to.have.property ( 'email' ).and.equal ( testuser.email );
                                expect( user ).to.have.property ( 'RoleId' ).and.equal ( testuser.RoleId );

                                testUser = user;
                                done();
                            } )
                            .error( done );
                    }
                } )
        } );

        it('should allow us to get list of roles', function ( done ) {

            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'array' );
                expect( result ).to.have.length.above( 0 );
                expect( result[ 0 ] ).to.be.an( 'object' );
                expect( result[ 0 ] ).to.contain.keys( 'id', 'name', 'description', 'permissions' );

                done();
            };

            ctrl.listAction();
        });
    });

    describe('.getAction()', function() {

        it('should allow us to get role by id', function ( done ) {
            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'array' );
                expect( result ).to.have.length( 1 );
                expect( result[ 0 ] ).to.be.an( 'object' );
                expect( result[ 0 ] ).to.contain.keys( 'id', 'name', 'description', 'permissions', 'count' );

                done();
            };

            ctrl.req.params.id = roleId_0;

            ctrl.getAction();
        });
    });

    describe('.deleteAction()', function() {

        it('should allow us to delete role with permissions', function ( done ) {
            
            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'string' ).and.equal ( 'role has been removed' );

                done();
            };

            ctrl.req.params.id = roleId_0;

            ctrl.deleteAction();
        });
    });
});
