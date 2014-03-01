module.exports = function ( sequelize, DataTypes ) {
    return sequelize.define( "Permission", 
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            action: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: [ 2, 50 ]
                }
            },
            description: DataTypes.STRING
        },
        {
            paranoid: true,
            instanceMethods: {
                toJSON: function () {
                    var values = this.values;

                    delete values.createdAt;
                    delete values.updatedAt;
                    delete values.deletedAt;
                    
                    return values;
                }
            }
        } );
};
