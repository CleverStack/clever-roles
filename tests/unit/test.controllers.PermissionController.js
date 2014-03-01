var expect = require( 'chai' ).expect
  , testEnv = require( 'utils' ).testEnv();

var Controller
  , Service
  , Model;

describe ( 'controllers.PermissionController', function () {

    before( function ( done ) {
        testEnv( function ( _PermissionController_, _PermissionService_, _ORMPermissionModel_ ) {
            var req = {
                params: { action: 'fakeAction'},
                method: 'GET',
                query: {}
            };

            var res = {
                json: function () {}
            };

            var next = function () {};

            Controller = _PermissionController_;
            Service = _PermissionService_;
            Model = _ORMPermissionModel_;

            ctrl = new Controller( req, res, next );

            done();
        });
    } );

    describe('.listAction()', function() {

        before ( function ( done ) {
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

            Model
                .bulkCreate ( permissions )
                .success ( function () {
                    done();
                })
                .error ( done );
        } );

        it('should allow us to get list of permissions', function ( done ) {
                
            ctrl.send = function ( result, status ) {

                expect( status ).to.equal( 200 );

                expect( result ).to.be.an( 'array' ).and.have.length.above ( 0 );
                expect( result [ 0 ] ).to.be.an( 'object' ).and.be.ok;
                expect( result [ 0 ] ).to.contain.keys( 'id', 'action', 'description' );

                expect( result [ 0 ] ).to.not.contain.keys( 'createdAt', 'updatedAt', 'deletedAt' );

                done();                
            };

            ctrl.listAction();
        });
    });
});
