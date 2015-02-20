module.exports = require('classes').Module.extend({
    preRoute: function(AccountModel, RoleModel, PermissionModel, UserModel, _) {
        UserModel.on('beforeAllFindersOptions', function(findOptions, queryOptions, callback) {
            findOptions.include = findOptions.include || [];

            if (!_.findWhere(findOptions.include, { model: RoleModel.entity })) {
                findOptions.include.push({
                    model : RoleModel.entity,
                    include : [{
                        model : PermissionModel.entity
                    }]
                });
            }

            if (!_.findWhere(findOptions.include, { model: AccountModel.entity })) {
                findOptions.include.push({
                    model : AccountModel.entity
                });
            }

            callback(null);
        });

        // Include the accounts roles and permissions
        AccountModel.on('beforeAllFindersOptions', function(findOptions, queryOptions, callback) {
            findOptions.include = findOptions.include || [];

            if (!_.findWhere(findOptions.include, { model: RoleModel.entity })) {
                findOptions.include.push({
                    model : RoleModel.entity
                });
            }

            if (!_.findWhere(findOptions.include, { model: PermissionModel.entity })) {
                findOptions.include.push({
                    model : PermissionModel.entity
                });
            }

            callback(null);
        });

        // Include the roles permissions
        RoleModel.on('beforeAllFindersOptions', function(findOptions, queryOptions, callback) {
            findOptions.include = findOptions.include || [];

            if (!_.findWhere(findOptions.include, { model: PermissionModel.entity })) {
                findOptions.include.push({
                    model : PermissionModel.entity
                });
            }

            if (!_.findWhere(findOptions.include, { model: UserModel.entity })) {
                findOptions.include.push({
                    model : UserModel.entity
                });
            }

            callback(null);
        });

        PermissionModel.on('beforeAllFindersOptions', function(findOptions, queryOptions, callback) {
            findOptions.include = findOptions.include || [];

            if (!_.findWhere(findOptions.include, { model: RoleModel.entity })) {
                findOptions.include.push({
                    model : RoleModel.entity
                });
            }

            callback(null);
        });
    }
});
