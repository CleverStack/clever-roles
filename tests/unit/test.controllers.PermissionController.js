var expect      = require('chai').expect
  , sinon       = require('sinon')
  , injector    = require('injector')
  , roleModule
  , Controller
  , Service;

describe('CleverRoles.Controller.PermissionController', function() {

  before(function(done) {
    roleModule      = injector.getInstance('cleverRoles');
    Controller      = roleModule.controllers.PermissionController;
    Service         = roleModule.services.PermissionService;

    done();
  });

  function fakeRequest(req) {
    req.method  = req.method || 'GET';
    req.url     = req.url || '/account/1/permissions';
    req.query   = req.query || {};
    req.body    = req.body || {};
    req.params  = req.params || {};

    return req;
  }

  function fakeResponse(cb) {
    return {
      json: function(code, message) {
        setTimeout(function() {
          cb(code, JSON.parse(JSON.stringify(message)))                    
        }, 10);
      },

      send: function(code, message) {
        setTimeout(function() {
          cb(code, message)
        }, 10);
      }
    };
  }

  it('should have loaded');

  describe('.requiresPermission() middleware', function() {
    it('should allow requests to continue when the user has permission.')
    it('should not allow requests to continue when the user doesn\'t have permission.');

    it('should work without any options');
    it('should work with the all option');
    it('should work with all option but overriding any specific action');
    it('should allow you to use other middleware for any route option');
  });

});
