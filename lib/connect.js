(function() {
  var Promise, config, connection, fs, getConnection, getQuery, mysql;

  Promise = require('bluebird');

  mysql = require('mysql');

  fs = require('fs');

  Promise.promisifyAll(mysql);

  Promise.promisifyAll(require("mysql/lib/Connection").prototype);

  Promise.promisifyAll(require("mysql/lib/Pool").prototype);

  config = JSON.parse(fs.readFileSync(__dirname + '/../config.json'));

  getConnection = function() {
    var connection;
    connection = mysql.createConnection({
      host: 'localhost',
      user: config.username,
      password: config.password,
      database: config.database
    });
    return connection.connectAsync()["return"](connection);
  };

  connection = getConnection();

  getQuery = function(query) {
    return connection.then((function(_this) {
      return function(db) {
        return db.queryAsync(query);
      };
    })(this));
  };

  module.exports = getQuery;

}).call(this);
