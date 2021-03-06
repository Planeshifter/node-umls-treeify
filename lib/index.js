(function() {
  var Promise, corpus, createTree, csv, data, delim, fNetwork, fs, getQuery, mime, mime_type, program, util, winston;

  getQuery = require('./connect');

  fNetwork = require('./network');

  winston = require('winston');

  Promise = require('bluebird');

  program = require('commander');

  fs = require('fs');

  csv = require('csv');

  mime = require('mime');

  util = require('util');

  fNetwork.then(function(net) {
    return net.concepts[1].print();
  });

  createTree = function(corpus) {};

  program.version('0.1.0').option('-i, --input [value]', 'Load data from disk').option('-l, --list <items>', 'A list of input texts').option('-o, --output [value]', 'Write results to file').option('-t, --threshold <n>', 'Threshold for Tree Nodes', parseInt).option('-c, --combine', 'Merge document trees to form corpus tree').option('-d, --delim [value]', 'Delimiter to split text into documents').option('-v, --verbose', 'Print additional logging information').parse(process.argv);

  corpus;

  delim = String(program.delim);

  if (program.list) {
    delim = delim != null ? delim : ";";
    corpus = program.list.split(delim);
    createTree(corpus);
  } else if (program.input) {
    data = fs.readFileSync(program.input);
    mime_type = mime.lookup(program.input);
  }

  switch (mime_type) {
    case "text/plain":
      delim = delim != null ? delim : " ";
      corpus = String(data).replace(/\r\n?/g, "\n").split(delim).clean("");
      createTree(corpus);
      break;
    case "text/csv":
      csv.parse(String(data), (function(_this) {
        return function(err, output) {
          corpus = output.map(function(d) {
            return d[0];
          });
          return createTree(corpus);
        };
      })(this));
  }

}).call(this);
