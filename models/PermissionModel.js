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
        }
    });
};
