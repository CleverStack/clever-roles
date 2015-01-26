module.exports = function ( Model, config ) {
    return Model.extend( 'Role',
    {
        type:               config[ 'clever-roles' ].driver || 'ORM',
        softDeletable:      true,
        timeStampable:      true
    },
    {
        id: {
            type: Number,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: String,
            allowNull: false,
            validate: {
                len: [ 2, 32 ]
            }
        },
        description: {
            type: String,
            allowNull: true
        },
        systemRole: {
            type: Boolean,
            default: false
        }
    });
};