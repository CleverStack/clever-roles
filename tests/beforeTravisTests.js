var Q = require ( 'q' )
  , spawn = require ( 'child_process' ).spawn
  , path = require ( 'path' )
  , fs = require ( 'fs' )
  , ncp = require ( 'ncp' ).ncp
  , mName = 'clever-roles'
  , prName = 'testProject';

//create test project
function createProject ( step ) {
    var defered = Q.defer ()
      , proc = spawn ( 'clever', [ 'init', '--allow-root', '--skip-protractor', prName ] );

    console.log ( 'step #' + step + ' - create test project - start\n' );

    proc.stdout.on ( 'data', function ( data ) {
        var str = data.toString ();

        if ( str.match ( 'ing' ) !== null ) {
            console.log ( str )
        }
    } );

    proc.stderr.on ( 'data', function ( data ) {
        defered.reject ( 'Error in step #' + step + ' - ' + data.toString () + '\n' );
    } );

    proc.on ( 'close', function ( code ) {
        console.log ( 'step #' + step + ' - process exited with code ' + code + '\n' );
        defered.resolve ( ++step );
    } );

    return defered.promise;
}

//install clever-orm module to test project
function installORM ( step ) {
    var defered = Q.defer ()
      , objs = [
            { reg: 'Database username', write: 'travis\n' },
            { reg: 'Database password', write: '\n' },
            { reg: 'Database name', write: 'test_db\n' },
            { reg: 'Database dialect', write: '\n' },
            { reg: 'Database port', write: '3306\n' },
            { reg: 'Database host', write: '127.0.0.1\n' }
        ]
      , proc = spawn ( 'clever', [ 'install', 'clever-orm' ], { cwd: path.join ( __dirname, '../', prName ) } );

    console.log ( 'step #' + step + ' - install clever-orm module - start\n' );

    proc.stdout.on ( 'data', function ( data ) {
        var str = data.toString ()
          , index = -1;

        if ( str.match ( 'ing' ) !== null ) {
            console.log ( str );
        }

        objs.forEach ( function ( obj, i ) {
            if ( str.match ( obj.reg ) !== null ) {
                proc.stdin.write ( obj.write );
                index = i;
            }
        } );

        if ( index !== -1 ) {
            objs.splice ( index, 1 );
        }
    } );

    proc.stderr.on ( 'data', function ( data ) {
        defered.reject ( data.toString ( 'Error in step #' + step + ' - ' + data.toString () + '\n' ) );
    } );

    proc.on ( 'close', function ( code ) {
        console.log ( 'step #' + step + ' - process exited with code ' + code + '\n' );
        defered.resolve ( ++step );
    } );

    return defered.promise;
}

//install clever-auth module to test project
function installAuth ( step ) {
    var defered = Q.defer ()
      , proc = spawn ( 'clever', [ 'install', 'clever-auth' ], { cwd: path.join ( __dirname, '../', prName ) } );

    console.log ( 'step #' + step + ' - install clever-auth module - start\n' );

    proc.stdout.on ( 'data', function ( data ) {
        var str = data.toString ();

        if ( str.match ( 'ing' ) !== null ) {
            console.log ( str );
        }
    } );

    proc.stderr.on ( 'data', function ( data ) {
        defered.reject ( data.toString ( 'Error in step #' + step + ' - ' + data.toString () + '\n' ) );
    } );

    proc.on ( 'close', function ( code ) {
        console.log ( 'step #' + step + ' - process exited with code ' + code + '\n' );
        defered.resolve ( ++step );
    } );

    return defered.promise;
}

//copy clever-roles module in test project
function copyModule ( step ) {
    var defered = Q.defer ()
      , fromDir = path.join ( __dirname, '../' )
      , toDir = path.join ( __dirname, '../', prName, 'backend', 'modules', mName )
      , options = {
            filter: function ( file ) {
                return file.match ( prName ) === null
            }
        };

    console.log ( 'step #' + step + ' - copy ' + mName + ' modyle in test project - start\n' );

    ncp ( fromDir, toDir, options, function ( err ) {
        if ( err ) {
            return defered.reject ( 'Error in step #' + step + ' - ' + err + '\n' );
        }

        console.log ( 'step #' + step + ' - process exited with code 0\n' );
        defered.resolve ( ++step );
    } );

    return defered.promise;
}

//create and update config files
function configFiles ( step ) {
    var deferred = Q.defer ()
      , ormFile = path.join ( __dirname, '../', prName, 'backend', 'modules', 'clever-orm', 'config', 'default.json' )
      , comFile = path.join ( __dirname, '../', prName, 'backend', 'config', 'test.json' )
      , ormData = {
            "clever-orm": {
                "db": {
                    "username": "travis",
                    "password": "",
                    "database": "test_db",
                    "options": {
                        "host": "127.0.0.1",
                        "dialect": "mysql",
                        "port": 3306
                    }
                },
                "modelAssociations": {
                    "UserModel": {
                        "belongsTo": [ "RoleModel" ]
                    },
                    "RoleModel": {
                        "hasMany": [  "PermissionModel" ],
                        "belongsTo": [ "UserModel" ]
                    },
                    "PermissionModel": {
                        "hasMany": [ "RoleModel" ]
                    }
                }
            }
        }
      , comData = {
            "environmentName": "TEST",
            "memcacheHost": "127.0.0.1:11211",
            "clever-orm": {
                "db": {
                    "username": "travis",
                    "password": "",
                    "database": "test_db",
                    "options": {
                        "dialect": "mysql",
                        "host": "127.0.0.1",
                        "port": "3306"
                    }
                }
            }
        };

    console.log ( 'step #' + step + ' - create and update config files - start\n' );

    fs.writeFile ( ormFile, JSON.stringify ( ormData ), function ( err ) {

        if ( err ) {
            return deferred.reject ( 'Error in step #' + step + ' - ' + err + '\n' );
        }

        fs.writeFile ( comFile, JSON.stringify ( comData ), function ( err ) {

            if ( err ) {
                return deferred.reject ( 'Error in step #' + step + ' - ' + err + '\n' );
            }

            console.log ( 'step #' + step + ' - process exited with code 0\n' );
            deferred.resolve ( ++step );
        } );
    } );

    return deferred.promise;
}

//added clever-roles module in bundledDependencies
function bundled ( step ) {
    var deferred = Q.defer ()
      , file = path.join ( __dirname, '../', prName, 'backend', 'package.json' );

    console.log ( 'step #' + step + ' - added ' + mName + ' module in bundledDependencies\n' );

    fs.readFile ( file, function ( err, data ) {

        if ( err ) {
            return deferred.reject ( 'Error in step #' + step + ' - ' + err + '\n' );
        }

        data = JSON.parse ( data );
        data.bundledDependencies.push ( mName );

        fs.writeFile ( file, JSON.stringify ( data ), function ( err ) {

            if ( err ) {
                return deferred.reject ( 'Error in step #' + step + ' - ' + err + '\n' );
            }

            console.log ( 'step #' + step + ' - process exited with code 0\n' );
            deferred.resolve ( ++step );
        } );
    } );

    return deferred.promise;
}

createProject ( 1 )
    .then ( installORM )
    .then ( configFiles )
    .then ( installAuth )
    .then ( copyModule )
    .then ( bundled )
    .fail ( function ( err ) {
        console.log ( err );
    } );