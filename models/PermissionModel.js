module.exports = function( Model ) {
    return Model.extend( 'Permission',
    {
        id: {
            type: Number,
            primaryKey: true,
            autoIncrement: true
        },
        action: {
            type: String,
            allowNull: false,
            validate: {
                len: [ 2, 50 ]
            }
        },
        description: String
    });
};