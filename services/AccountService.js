module.exports = function ( Service, AccountModel ) {
    return Service.extend({
        model: AccountModel
    });
}