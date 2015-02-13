module.exports = require('classes').Module.extend({
    preRoute: function(AccountModel, RoleModel, PermissionModel, UserModel, _) {
        UserModel.on('beforeAllFindersOptions', function(findOptions, queryOptions, callback) {
            findOptions.include = findOptions.include || [];

            if (!_.findWhere(findOptions.include, { model: RoleModel._model })) {
                findOptions.include.push({
                    model : RoleModel._model,
                    include : [{
                        model : PermissionModel._model
                    }]
                });
            }

            if (!_.findWhere(findOptions.include, { model: AccountModel._model })) {
                findOptions.include.push({
                    model : AccountModel._model
                });
            }

            callback(null);
        });

        // Include the accounts roles and permissions
        AccountModel.on('beforeAllFindersOptions', function(findOptions, queryOptions, callback) {
            findOptions.include = findOptions.include || [];

            if (!_.findWhere(findOptions.include, { model: RoleModel._model })) {
                findOptions.include.push({
                    model : RoleModel._model
                });
            }

            if (!_.findWhere(findOptions.include, { model: PermissionModel._model })) {
                findOptions.include.push({
                    model : PermissionModel._model
                });
            }

            callback(null);
        });

        // Include the roles permissions
        RoleModel.on('beforeAllFindersOptions', function(findOptions, queryOptions, callback) {
            findOptions.include = findOptions.include || [];

            if (!_.findWhere(findOptions.include, { model: PermissionModel._model })) {
                findOptions.include.push({
                    model : PermissionModel._model
                });
            }

            if (!_.findWhere(findOptions.include, { model: UserModel._model })) {
                findOptions.include.push({
                    model : UserModel._model
                });
            }

            callback(null);
        });

        PermissionModel.on('beforeAllFindersOptions', function(findOptions, queryOptions, callback) {
            findOptions.include = findOptions.include || [];

            if (!_.findWhere(findOptions.include, { model: RoleModel._model })) {
                findOptions.include.push({
                    model : RoleModel._model
                });
            }

            callback(null);
        });
    }
});
