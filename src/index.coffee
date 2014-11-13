getQuery = require './connect'
network_promise = require './network'
winston = require 'winston'


network_promise.then( (net) ->

  console.log(net.concepts)
)
