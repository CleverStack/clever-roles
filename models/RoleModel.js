module.exports = function(Model, config, utils, Exceptions, PermissionModel, UserModel) {
  return Model.extend('Role',
  {
    type            : config['clever-roles'].driver || 'ORM',
    timeStampable   : true,
    softDeleteable  : false,

    'PermissionModel beforeAllFindersOptions': function(findOptions, queryOptions, callback) {
      utils.helpers
        .includeModel(findOptions, this, 'Roles');

      callback(null, findOptions);
    },

    'UserModel beforeAllFindersOptions': function(findOptions, queryOptions, callback) {
      utils.helpers
        .includeModel(findOptions, this, 'Role', {
          as: 'Permissions',
          model: PermissionModel.entity
        });

      callback(null, findOptions);
    },

    beforeAllFindersOptions: function(findOptions, queryOptions, callback) {
      utils.helpers
        .includeModel(findOptions, PermissionModel, 'Permissions')
        .includeModel(findOptions, UserModel, 'Users');
    
      callback(null, findOptions);
    },

    beforeCreate: function(values, queryOptions, callback) {
      if (!values.name) {
        callback(new Exceptions.InvalidData('You must provide a name'));
      } else {
        this.find({where: {AccountId: values.AccountId || values.Account, name: values.name}}, queryOptions).then(function(role) {
          if (role === null) {
            callback(null);
          } else {
            callback(new Exceptions.InvalidData('Role with that name already exists'));
          }
        })
      }
    },

    beforeUpdate: function() {
      return this.beforeCreate.apply(this, [].slice.call(arguments));
    }
  },
  {
    id: {
      type          : Number,
      primaryKey    : true,
      autoIncrement : true
    },
    name: {
      type          : String,
      allowNull     : false,
      validate : {
        len         : [2, 32]
      }
    },
    description: {
      type          : String,
      allowNull     : true
    },
    systemRole: {
      type          : Boolean,
      default       : false
    }
  });
};
