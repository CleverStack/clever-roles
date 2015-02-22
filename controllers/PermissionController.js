var injector = require('injector');

module.exports = function(async, _, Controller, PermissionService) {
  var AccountController = null;

  var PermissionController = Controller.extend(
  {  
    service: PermissionService,

    route: [
      '[POST] /account/:AccountId/permission/?',
      '/account/:AccountId/permission/:id/?',
      '/account/:AccountId/permission/:id/:action/?',
      '/account/:AccountId/permissions/?',
      '/account/:AccountId/permissions/:action/?'
    ],

    autoRouting: [
      function(req, res, next) {
        return PermissionController.requiresPermission({
          all: 'Permission.$action'
        })(req, res, next);
      },

      function(req, res, next) {
        if (AccountController === null) {
          AccountController = injector.getInstance('AccountController');
        }

        AccountController.addAccountIdToRequest({
          all             : false,
          listAction      : true,
          getAction       : true,
          postAction      : true,
          putAction       : true,
          deleteAction    : true
        })(req, res, next);
      }
    ],

    /*
      PermissionController.requiresPermission('Some.permission');
      // or
      PermissionController.requiresPermission(['Some.permission', 'Another.permission']);
    */
    requiresPermission: function(requiredPermissions) {
      if (requiredPermissions instanceof Array) {
        requiredPermissions = {
          all: requiredPermissions
        }
      } else if (typeof requiredPermissions !== 'object') {
        requiredPermissions = {
          all: [requiredPermissions]
        }
      }

      return function(req, res, next) {
        var user    = req.user
          , method  = req.method.toLowerCase()
          , id      = req.params.id
          , action  = req.params.action || id;

        if (!!id && !!action && action === 'list') {
          action = 'get'
          req.params.action = 'get';
        } else if (!action && method === 'get' && /^\/.*\/(.*\/?)$/ig.test(req.url)) {
          action = 'list';
        } else if (/^[0-9a-fA-F]{24}$/.test(action) || !isNaN(action)) {
          action = 'get';
        } else {
          if (req.params.action) {
            action = req.params.action;
          } else if (method === 'get' && !id) {
            action = 'list';
          } else {
            action = method;
          }
        }

        async.waterfall(
          [

            function determinePermissions(callback) {
              var actionName = (!!action ? action : method) + 'Action'
                , permissions = [];
              
              if (typeof requiredPermissions[actionName] !== 'undefined') {
                if (requiredPermissions[actionName] !== null) {
                  if (requiredPermissions[actionName] instanceof Array) {
                    permissions = permissions.concat(requiredPermissions[actionName]);
                  } else {
                    permissions.push(requiredPermissions[actionName]);
                  }
                }
              } else if (typeof requiredPermissions.all !== 'undefined') {
                if (requiredPermissions.all !== null) {
                  permissions = requiredPermissions.all instanceof Array ? requiredPermissions.all : [requiredPermissions.all];
                }
              }

              callback(null, permissions);
            },

            function userRoleHasPermission(permissions, callback) {
              var hasPermission = true;

              if (!!permissions.length && !req.isAuthenticated()) {
                return callback('User is not authenticated!');
              }

              permissions.every(function(requiredPermission) {
                if (/^([^\$]+)\.\$action/.test(requiredPermission)) {
                  requiredPermission = RegExp.$1 + '.';

                  switch(action) {
                  
                  case 'get':
                    requiredPermission += 'view';
                    break;
                  case 'post':
                    requiredPermission += 'create';
                    break;
                  case 'put':
                    requiredPermission += 'edit';
                    break;
                  default:
                    requiredPermission += action;
                    break;
                  }
                }

                if (requiredPermission !== 'requiresLogin' && _.findWhere([].slice.call(user.Role.Permissions), { action: requiredPermission }) === undefined) {
                  callback('Logged in user does not have ' + requiredPermission + ' permission.');
                  hasPermission = false;
                  return false;
                }
                return true;
              });

              if (!!hasPermission) {
                callback(null);
              }
            }
          ],
          function(err) {
            if (err === null) {
              next();
            } else {
              console.dir(err);
              res.send(401, { statusCode: 401, message: err });
            }
          }

       );
      }
    }
  },
  {
    
  });

  return PermissionController;
}