module.exports = function( Model ) {
    return Model.extend( 'Account',
    {
        id: {
            type: Number,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: String,
            validate: {
                len: [ 2, 50 ]
            }
        },
        subdomain: {
            type: String,
            allowNull: false,
            unique: true,
            validate: {
                isAlphanumeric: true,
                len: [ 3, 16 ]
            }
        },
        active: {
            type: Boolean,
            allowNull: false,
            defaultValue: false
        },
        logo : {
            type: String,
            allowNull: true
        },
        themeColor : {
            type: String,
            allowNull: true
        },
        email : {
            type: String,
            allowNull: true,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        emailFwd : {
            type: String,
            allowNull: true
        },
        info: {
            type: String,
            allowNull: true
        }
    });
};