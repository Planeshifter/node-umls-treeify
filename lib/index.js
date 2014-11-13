(function() {
  var getQuery, network_promise;

  getQuery = require('./connect');

  network_promise = require('./network');

  network_promise.then(function(net) {
    return console.log(net.concepts);
  });

}).call(this);
