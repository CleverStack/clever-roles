module.exports = function(Model, config) {
  return Model.extend('Permission',
  {
    type:             config[ 'clever-roles' ].driver || 'ORM',
    softDeletable:    true,
    timeStampable:    true
  },
  {
    id: {
      type:           Number,
      primaryKey:     true,
      autoIncrement:  true
    },
    description:      String,
    action: {
      type:           String,
      allowNull:      false,
      validate: {
        len:          [2, 50]
      }
    },
    systemPermission: {
      type:           Boolean,
      default:        false
    },

    toJSON: function() {
      var json = this._super.apply(this, arguments);

      delete json.createdAt;
      delete json.updatedAt;
      
      return json;
    }
  });
};