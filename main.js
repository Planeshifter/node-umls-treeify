var BPromise, Promise, calculateCounts, constructSynsetData, corpus, createTree, csv, data, delim, fNetwork, fs, generateCorpusTree, getConcepts, getQuery, mime, mime_type, program, thresholdDocTree, thresholdWordTree, util, winston, _ref;

getQuery = require(__dirname + '/lib/connect');

fNetwork = require(__dirname + '/lib/network');

getConcepts = require(__dirname + '/lib/getCandidates');

constructSynsetData = require(__dirname + '/lib/constructSynsetData').constructSynsetData;

generateCorpusTree = require(__dirname + '/lib/treeGenerator').generateCorpusTree;

calculateCounts = require(__dirname + "/lib/counting");

_ref = require(__dirname + "/lib/thresholdTree"), thresholdDocTree = _ref.thresholdDocTree, thresholdWordTree = _ref.thresholdWordTree;

BPromise = require('bluebird');

winston = require('winston');

Promise = require('bluebird');

program = require('commander');

fs = require('fs');

csv = require('csv');

mime = require('mime');

util = require('util');

createTree = function(corpus) {
  var conceptCandidates, corpusTree, docTrees, finalTree;
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
  if (program.combine) {
    corpusTree = docTrees.then((function(_this) {
      return function(docs) {
        return generateCorpusTree(docs);
      };
    })(this));
    finalTree = corpusTree.then((function(_this) {
      return function(tree) {
        return calculateCounts(tree);
      };
    })(this));
    if (program.threshold) {
      finalTree = finalTree.then((function(_this) {
        return function(tree) {
          return thresholdDocTree(tree, program.threshold);
        };
      })(this));
    }
    return finalTree.then((function(_this) {
      return function(data) {
        var key, outputJSON, ret, value;
        for (key in data) {
          value = data[key];
          data[key].data.isa = null;
        }
        ret = {};
        ret.tree = data;
        ret.corpus = corpus;
        outputJSON = program.pretty ? JSON.stringify(ret, null, 2) : JSON.stringify(ret);
        if (program.output) {
          fs.writeFileSync(program.output, outputJSON);
        } else {
          console.log(outputJSON);
        }
      };
    })(this)).then((function(_this) {
      return function(d) {
        var code;
        console.log("Job successfully completed.");
        return process.exit(code = 0);
      };
    })(this))["catch"]((function(_this) {
      return function(e) {
        var code;
        console.log("Job aborted with errors.");
        return process.exit(code = 1);
      };
    })(this));
  }
};

program.version('0.1.0').option('-i, --input [value]', 'Load data from disk').option('-l, --list <items>', 'A list of input texts').option('-o, --output [value]', 'Write results to file').option('-t, --threshold <n>', 'Threshold for Tree Nodes', parseInt).option('-c, --combine', 'Merge document trees to form corpus tree').option('-d, --delim [value]', 'Delimiter to split text into documents').option('-v, --verbose', 'Print additional logging information').option('-p, --pretty', 'Prettify JSON output').parse(process.argv);

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
