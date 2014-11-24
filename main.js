var BPromise, Promise, constructSynsetData, corpus, createTree, csv, data, delim, fNetwork, fs, getConcepts, getQuery, mime, mime_type, program, util, winston;

getQuery = require(__dirname + '/lib/connect');

fNetwork = require(__dirname + '/lib/network');

getConcepts = require(__dirname + '/lib/getCandidates');

constructSynsetData = require(__dirname + '/lib/constructSynsetData').constructSynsetData;

BPromise = require('bluebird');

winston = require('winston');

Promise = require('bluebird');

program = require('commander');

fs = require('fs');

csv = require('csv');

mime = require('mime');

util = require('util');

createTree = function(corpus) {
  var conceptCandidates, docTrees;
  conceptCandidates = getConcepts(corpus);
  docTrees = conceptCandidates.map((function(_this) {
    return function(d, index) {
      var docTreeMsg, wordTrees;
      docTreeMsg = "Construct Candidate Set for Words of Doc " + index;
      console.time(docTreeMsg);
      wordTrees = d.map(function(w) {
        return constructSynsetData(w, index);
      });
      BPromise.all(wordTrees).then(console.timeEnd(docTreeMsg));
      return wordTrees;
    };
  })(this));
  return conceptCandidates.then((function(_this) {
    return function(data) {
      return console.log(util.inspect(data, null, 4));
    };
  })(this));
};

program.version('0.1.0').option('-i, --input [value]', 'Load data from disk').option('-l, --list <items>', 'A list of input texts').option('-o, --output [value]', 'Write results to file').option('-t, --threshold <n>', 'Threshold for Tree Nodes', parseInt).option('-c, --combine', 'Merge document trees to form corpus tree').option('-d, --delim [value]', 'Delimiter to split text into documents').option('-v, --verbose', 'Print additional logging information').parse(process.argv);

corpus;

delim = program.delim;

if (program.list) {
  if (delim == null) {
    delim = ";";
  }
  corpus = program.list.split(delim);
  createTree(corpus);
} else if (program.input) {
  data = fs.readFileSync(program.input);
  mime_type = mime.lookup(program.input);
}

switch (mime_type) {
  case "text/plain":
    if (delim == null) {
      delim = " ";
    }
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
