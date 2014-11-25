var Promise     = require( 'bluebird' )
  , spawn       = require ( 'child_process' ).spawn
  , path        = require ( 'path' )
  , fs          = require ( 'fs' )
  , ncp         = require ( 'ncp' ).ncp
  , mName       = 'clever-roles'
  , prName      = 'testProject';

//create test project
function createProject ( step ) {
    return new Promise( function( resolve, reject ) {
        var proc = spawn ( 'clever', [ 'init', '--allow-root', '--skip-protractor', prName ] );

        console.log ( 'step #' + step + ' - create test project - start\n' );

        proc.stdout.on ( 'data', function( data ) {
            var str = data.toString ();

            if ( str.match( 'ing' ) !== null ) {
                console.log ( str )
            }
        });

        proc.stderr.on ( 'data', function( data ) {
            reject ( 'Error in step #' + step + ' - ' + data.toString () + '\n' );
        });

        proc.on ( 'close', function( code ) {
            console.log ( 'step #' + step + ' - process exited with code ' + code + '\n' );
            resolve ( ++step );
        });
    });
}

function installORM() {
    return new Promise( function( resolve, reject ) {
        var objs = [
                { reg: /Database username/ , write: 'travis\n'   , done: false },
                { reg: /Database password/ , write: '\n'         , done: false },
                { reg: /Database name/     , write: 'test_db\n'  , done: false },
                { reg: /Database dialect/  , write: '\n'         , done: false },
                { reg: /Database port/     , write: '3306\n'     , done: false },
                { reg: /Database host/     , write: '127.0.0.1\n', done: false },
            ]
          , proc = spawn ( 'clever', [ 'install', 'clever-orm' ], { cwd: path.join( __dirname, '../', prName ) } );

        console.log( 'step #2 - install clever-orm module - begin\n' );

        proc.stdout.on('data', function (data) {
            var str = data.toString();

            if ( str.match( /ing/ ) !== null ) {
                console.log( str )
            } 

            objs.forEach ( function ( obj, i ) {
                if ( obj.done !== true && str.match( obj.reg ) !== null ) {
                    objs[i].done = true;
                    proc.stdin.write( obj.write );
                } 
            });
        });

        proc.stderr.on('data', function (data) {
            console.log( 'Error in step #2 - ' + data.toString() + '\n');
            reject ( data.toString() );
        });

        proc.on('close', function (code) {
            console.log('step #2 process exited with code ' + code + '\n' );
            resolve();
        });
    });
}

//install clever-auth module to test project
function installAuth( step ) {
    return new Promise( function( resolve, reject ) {
        var objs = [
                { reg: /Default Username\: \(default\)/, write: '\n', done: false },
                { reg: /Overwrite existing user with the same username\? \(Y\/n\)/, write: '\n', done: false },
                { reg: /Default Users Password\: \(clever\)/, write: '\n', done: false },
                { reg: /Default Users Email\: \(default@cleverstack.io\)/, write: '\n', done: false },
                { reg: /Default Users Firstname\: \(Clever\)/, write: '\n', done: false },
                { reg: /Default Users Lastname\: \(User\)/, write: '\n', done: false },
                { reg: /Default Users Phone Number\:/, write: '\n', done: false },
                { reg: /Default User has admin rights\: \(Y\/n\)/, write: '\n', done: false },
                { reg: /Default User has confirmed their email\: \(Y\/n\)/, write: '\n', done: false },
                { reg: /Default User has an active account\: \(Y\/n\)/, write: '\n', done: false }
            ]
          , proc = spawn ( 'clever', [ 'install', 'clever-auth'], { cwd: path.join( __dirname, '../', prName ) } );

        console.log( 'step #' + step + ' - grunt prompt:cleverAuthSeed clever-auth module - begin\n' );

        proc.stdout.on('data', function( data ) {
            var str = data.toString();

            objs.forEach ( function( obj, i ) {
                if ( obj.done !== true && str.match( obj.reg ) !== null ) {
                    objs[ i ].done = true;
                    proc.stdin.write( obj.write );
                } 
            });
        });

        proc.stderr.on('data', function( data ) {
            console.log( 'Error in step #7 - ' + data.toString() + '\n');
            reject ( data.toString() );
        });

        proc.on('close', function( code ) {
            console.log( 'step #7 process exited with code ' + code + '\n' );
            resolve();
        });
    });
}

//copy clever-roles module in test project
function copyModule ( step ) {
    return new Promise( function( resolve, reject ) {
        var fromDir     = path.join( __dirname, '../' )
          , toDir       = path.join( __dirname, '../', prName, 'backend', 'modules', mName )
          , options     = {
                filter: function( file ) {
                    return file.match ( prName ) === null
                }
            };

        console.log( 'step #' + step + ' - copy ' + mName + ' modyle in test project - start\n' );

        ncp( fromDir, toDir, options, function( err ) {
            if ( err ) {
                return reject( 'Error in step #' + step + ' - ' + err + '\n' );
            }

            console.log( 'step #' + step + ' - process exited with code 0\n' );
            resolve( ++step );
        });
    });
}

//create and update config files
function configFiles ( step ) {
    return new Promise( function( resolve, reject ) {
        var ormFile = path.join ( __dirname, '../', prName, 'backend', 'modules', 'clever-orm', 'config', 'default.json' )
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
                    "modelAssociations": {}
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

        console.log( 'step #' + step + ' - create and update config files - start\n' );

        fs.writeFile( ormFile, JSON.stringify( ormData ), function( err ) {

            if ( err ) {
                return reject ( 'Error in step #' + step + ' - ' + err + '\n' );
            }

            fs.writeFile( comFile, JSON.stringify ( comData ), function ( err ) {

                if ( err ) {
                    return reject( 'Error in step #' + step + ' - ' + err + '\n' );
                }

                console.log( 'step #' + step + ' - process exited with code 0\n' );
                resolve( ++step );
            });
        });
    });
}

//added clever-roles module in bundledDependencies
function bundled ( step ) {
    return new Promise( function( resolve, reject ) {
        var file = path.join ( __dirname, '../', prName, 'backend', 'package.json' );

        console.log( 'step #' + step + ' - added ' + mName + ' module in bundledDependencies\n' );

        fs.readFile( file, function( err, data ) {

            if ( err ) {
                return reject( 'Error in step #' + step + ' - ' + err + '\n' );
            }

            data = JSON.parse( data );
            data.bundledDependencies.push( mName );

            fs.writeFile( file, JSON.stringify( data ), function( err ) {

                if ( err ) {
                    return reject( 'Error in step #' + step + ' - ' + err + '\n' );
                }

                console.log( 'step #' + step + ' - process exited with code 0\n' );
                resolve( ++step );
            });
        });
    });
}

createProject ( 1 )
    .then ( installORM )
    .then ( configFiles )
    .then ( installAuth )
    .then ( copyModule )
    .then ( bundled )
    .catch ( function ( err ) {
        console.log ( err );
    } );