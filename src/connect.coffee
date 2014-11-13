Promise = require 'bluebird'
mysql = require 'mysql'
fs = require 'fs'

Promise.promisifyAll mysql
Promise.promisifyAll require("mysql/lib/Connection").prototype
Promise.promisifyAll require("mysql/lib/Pool").prototype

config = JSON.parse(fs.readFileSync __dirname + '/../config.json')

getConnection = () ->
    connection = mysql.createConnection({
      host     : 'localhost',
      user     : config.username,
      password : config.password
      database : config.database
    })
    return connection.connectAsync().return(connection)

connection = getConnection()

getQuery = (query) ->
    connection.then( (db) =>
      db.queryAsync(query)
    )

module.exports = getQuery
