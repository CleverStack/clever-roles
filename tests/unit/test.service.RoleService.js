var expect      = require('chai').expect
  , utils       = require('utils')
  , injector    = require('injector')
  , sinon       = require('sinon')
  , env         = utils.bootstrapEnv()
  , Service     = injector.getInstance('Service')
  , Model       = injector.getInstance('Model')
  , roleModule
  , RoleModel
  , RoleService;

describe('CleverRoles.Service.RoleService', function () {

  before(function(done) {
    roleModule          = injector.getInstance('cleverRoles');

    RoleModel     = roleModule.models.RoleModel;
    RoleService   = roleModule.services.RoleService;

    done();
  });

  it('should have loaded the RoleService', function(done) {
    expect(RoleService instanceof Service.Class).to.eql(true);
    expect(RoleService.on).to.be.a('function');
    expect(RoleService.find).to.be.a('function');
    expect(RoleService.findAll).to.be.a('function');
    expect(RoleService.create).to.be.a('function');
    expect(RoleService.update).to.be.a('function');
    expect(RoleService.destroy).to.be.a('function');
    expect(RoleService.query).to.be.a('function');
    expect(RoleService.model).to.equal(RoleModel);

    done();
  });

  it('should allow you to create with permissions');
  it('should allow you to update with permissions');
  it('should allow you to delete with permissions');

});