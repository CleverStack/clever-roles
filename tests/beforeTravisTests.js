var Promise     = require('bluebird')
  , spawn       = require('child_process').spawn
  , path        = require('path')
  , fs          = require('fs')
  , ncp         = require('ncp').ncp
  , prName      = 'testProject'
  , assetRoot   = path.resolve(path.join(__dirname, 'assets'))
  , prRoot      = path.resolve(path.join(assetRoot, prName))
  , moduleName  = path.resolve(path.join(__dirname, '../')).split(path.sep).pop();

function createProject(step) {
  return new Promise(function(resolve, reject) {
    var proc = spawn('clever', [ 'init', '-f', '-A', prName, 'backend' ], { cwd: assetRoot });

    console.log('step #' + step + ' - create test project - begin\n');

    proc.stdout.on('data', function (data) {
      var str = data.toString();  

      if (str.match(/ing/) !== null) {
        console.log(str);
      }
    });

    proc.stderr.on('data', function(data) {
      console.log('Error in step #' + step + ' - ' + data.toString() + '\n');
      reject (data.toString()); 
    });

    proc.on('close', function(code) {
      console.log('step #' + step + ' process exited with code ' + code + '\n');
      resolve(++step);
    });
  });
}

function installORM(step) {
  return new Promise(function(resolve, reject) {
    var objs = [
        { reg: /Database username/ , write: 'travis\n'   , done: false },
        { reg: /Database password/ , write: '\n'         , done: false },
        { reg: /Database name/     , write: 'test_db\n'  , done: false },
        { reg: /Database dialect/  , write: '\n'         , done: false },
        { reg: /Database port/     , write: '3306\n'     , done: false },
        { reg: /Database host/     , write: '127.0.0.1\n', done: false },
      ]
      , proc = spawn ('clever', [ 'install', 'clever-orm' ], { cwd: prRoot });

    console.log('step #' + step + ' - install clever-orm module - begin\n');

    proc.stdout.on('data', function(data) {
      var str = data.toString();

      if (str.match(/ing/) !== null) {
        console.log(str);
      } 

      objs.forEach(function(obj, i) {
        if (obj.done !== true && str.match(obj.reg) !== null) {
          objs[ i ].done = true;
          proc.stdin.write(obj.write);
        } 
      });
    });

    proc.stderr.on('data', function(data) {
      console.log('Error in step #' + step + ' - ' + data.toString() + '\n');
      reject(data.toString());
    });

    proc.on('close', function(code) {
      console.log('step #' + step + ' process exited with code ' + code + '\n');
      resolve(++step);
    });
  });
}

//install clever-auth module to test project
function installAuth(step) {
  return new Promise(function(resolve, reject) {
    var objs = [
        { reg: /What environment is this configuration for\?/, write: '\n', done: false },
        { reg: /Secret key used to secure your passport sessions/, write: '\n', done: false },
        { reg: /What database driver module to use\: \(Use arrow keys\)/, write: '\n', done: false },
        { reg: /Session Storage Driver\: \(Use arrow keys\)/, write: '\n', done: false },
        { reg: /Redis host\: \(localhost\)/, write: '\n', done: false },
        { reg: /Redis port\: \(6379\)/, write: '\n', done: false },
        { reg: /Redis prefix\:/, write: '\n', done: false },
        { reg: /Redis key\:/, write: '\n', done: false },
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
      , proc = spawn ('clever', [ 'install', 'clever-auth'], { cwd: prRoot });

    console.log('step #' + step + ' - clever install clever-auth - begin\n');

    proc.stdout.on('data', function(data) {
      var str = data.toString();

      objs.forEach (function(obj, i) {
        if (obj.done !== true && str.match(obj.reg) !== null) {
          objs[ i ].done = true;
          proc.stdin.write(obj.write);
        } 
      });
    });

    proc.stderr.on('data', function(data) {
      console.log('Error in step #' + step + ' - ' + data.toString() + '\n');
      reject (data.toString());
    });

    proc.on('close', function(code) {
      console.log('step #' + step + ' process exited with code ' + code + '\n');
      resolve(++step);
    });
  });
}

//copy clever-roles module in test project
function copyModule (step) {
  return new Promise(function(resolve, reject) {
    var fromDir     = path.resolve(path.join(__dirname, '../'))
      , toDir       = path.join(prRoot, 'modules', moduleName)
      , options     = {
        filter: function(file) {
          return file.match (prName) === null
        }
      };

    console.log('step #' + step + ' - copy ' + moduleName + ' module in test project - start\n');

    ncp(fromDir, toDir, options, function(err) {
      if (err) {
        return reject('Error in step #' + step + ' - ' + err + '\n');
      }

      console.log('step #' + step + ' - process exited with code 0\n');
      resolve(++step);
    });
  });
}

//added clever-roles module in bundledDependencies
function bundled (step) {
  return new Promise(function(resolve, reject) {
    var file = path.join(prRoot, 'package.json');

    console.log('step #' + step + ' - added ' + moduleName + ' module in bundledDependencies\n');

    fs.readFile(file, function(err, data) {

      if (err) {
        return reject('Error in step #' + step + ' - ' + err + '\n');
      }

      data = JSON.parse(data);
      data.bundledDependencies.push(moduleName);

      fs.writeFile(file, JSON.stringify(data), function(err) {

        if (err) {
          return reject('Error in step #' + step + ' - ' + err + '\n');
        }

        console.log('step #' + step + ' - process exited with code 0\n');
        resolve(++step);
      });
    });
  });
}

createProject (1)
  .then (installORM)
  .then (installAuth)
  .then (copyModule)
  .then (bundled)
  .catch (function (err) {
    console.log (err);
  });