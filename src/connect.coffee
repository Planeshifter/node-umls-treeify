Promise = require 'bluebird'
mysql = Promise.promisifyAll(require 'mysql')
fs = require 'fs'

config = JSON.parse(fs.readFileSync __dirname + '/../config.json')

getConnection = () ->
    connection = mysql.createConnection({
      host     : 'localhost',
      user     : config.username,
      password : config.password
    })
    return connection.connectAsync().return(connection)

module.exports = getConnection
