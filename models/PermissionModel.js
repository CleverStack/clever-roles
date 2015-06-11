module.exports = function(Model, config, async, utils, Exceptions, UserModel, AccountModel) {
  return Model.extend('Permission',
  {
    type            : config['clever-roles'].driver || 'ORM',
    timeStampable   : true,
    softDeleteable  : false,

    beforeCreate: function(values, queryOptions, callback) {
      if (!values.action) {
        callback(new Exceptions.InvalidData('You must provide an action name'));
      } else {
        this.find({where: {AccountId: values.AccountId || values.Account, action: values.action}}, queryOptions).then(function(permission) {
          if (permission === null) {
            callback(null);
          } else {
            callback(new Exceptions.InvalidData('Error, permission with that action name already exists'));
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
    description     : String,
    action: {
      type          : String,
      allowNull     : false,
      validate: {
        len         : [2, 50]
      }
    },
    systemPermission: {
      type          : Boolean,
      default       : false
    }
  });
};
