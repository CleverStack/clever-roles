module.exports = function( Model ) {
    return Model.extend( 'Permission',
    {
        id: {
            type:           Number,
            primaryKey:     true,
            autoIncrement:  true
        },
        description:        String,
        action: {
            type:           String,
            allowNull:      false,
            validate: {
                len:        [ 2, 50 ]
            }
        },
        systemPermission: {
            type:           Boolean,
            default:        false
        },
        toJSON: function() {
            var json = this._super.apply( this, arguments );

            delete json.createdAt;
            delete json.updatedAt;
            
            return json;
        }
    });
};
