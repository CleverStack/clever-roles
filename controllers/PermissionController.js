module.exports = function ( PermissionService ) {

    return (require ( 'classes' ).Controller).extend (
        {
            service: PermissionService
        },
        /* @Prototype */
        {
            listAction: function () {
                PermissionService.list ()
                    .then ( this.proxy ( 'handleServiceMessage' ) )
                    .fail ( this.proxy ( 'handleException' ) );
            },

            handleServiceMessage: function ( obj ) {

                if ( obj.statuscode ) {
                    this.send ( obj.message, obj.statuscode );
                    return;
                }

                this.send ( obj, 200 );
            }

        } );
}
