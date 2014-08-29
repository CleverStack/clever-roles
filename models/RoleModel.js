module.exports = function ( Model ) {
    return Model.extend( 'Role',
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
