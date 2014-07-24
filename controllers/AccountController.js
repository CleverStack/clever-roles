module.exports = function( Controller, AccountService, PermissionController ) {
    return Controller.extend(
    /** @Class **/
    {
        service: AccountService,
        autoRouting: [
            PermissionController.requiresPermission({
                all: 'Account.$action'
            })
        ]
    },
    /** @Prototype **/
    {

    });
}