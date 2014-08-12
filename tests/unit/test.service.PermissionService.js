var expect      = require( 'chai' ).expect
  , utils       = require( 'utils' )
  , injector    = require( 'injector' )
  , sinon       = require( 'sinon' )
  , env         = utils.bootstrapEnv()
  , Service     = injector.getInstance( 'Service' )
  , Model       = injector.getInstance( 'Model' )
  , roleModule
  , PermissionModel
  , PermissionService;

describe( 'CleverRoles.Service.PermissionService', function () {

    before( function( done ) {
        roleModule          = injector.getInstance( 'cleverRoles' );

        PermissionModel     = roleModule.models.PermissionModel;
        PermissionService   = roleModule.services.PermissionService;

        done();
    });

    it( 'should have loaded the PermissionService', function( done ) {
        expect( PermissionService instanceof Service.Class ).to.eql( true );
        expect( PermissionService.on ).to.be.a( 'function' );
        expect( PermissionService.find ).to.be.a( 'function' );
        expect( PermissionService.findAll ).to.be.a( 'function' );
        expect( PermissionService.create ).to.be.a( 'function' );
        expect( PermissionService.update ).to.be.a( 'function' );
        expect( PermissionService.destroy ).to.be.a( 'function' );
        expect( PermissionService.query ).to.be.a( 'function' );
        expect( PermissionService.model ).to.equal( PermissionModel );

        done();
    });

    it( 'should allow you to create with roles' );
    it( 'should allow you to update with roles' );
    it( 'should allow you to delete with roles' );

});
