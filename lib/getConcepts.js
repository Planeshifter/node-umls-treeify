(function() {
  var BPromise, analyze, args, child_process, command, config, escape, fs, getCorpusSynsets, package_folder, parseStringAsync, path, tm, typeIsArray, util, _;

  tm = require('text-miner');

  BPromise = require('bluebird');

  _ = require('underscore');

  util = require('util');

  fs = BPromise.promisifyAll(require('fs'));

  path = require('path');

  child_process = BPromise.promisifyAll(require('child_process'));

  parseStringAsync = BPromise.promisify(require('xml2js').parseString);

  typeIsArray = Array.isArray || function(value) {
    return {}.toString.call(value) === '[object Array]';
  };

  Array.prototype.removeAll = function(v) {
    var x, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = this.length; _i < _len; _i++) {
      x = this[_i];
      if (x !== v) {
        _results.push(x);
      }
    }
    return _results;
  };

  config = JSON.parse(fs.readFileSync(__dirname + '/../config.json'));

  escape = function(str) {
    return '"' + str + '"';
  };

  args = ['--username ' + escape(config.umls.username), '--password ' + escape(config.umls.password), '--email ' + escape(config.umls.email)];

  command = 'sh SKR_Web_API_V2_1/run.sh MMCustom ' + args.join(' ');

  package_folder = path.join(__dirname, '..');

  analyze = (function(_this) {
    return function(doc) {
      var pWrite, proc;
      pWrite = fs.writeFileAsync('temp.txt', doc);
      proc = pWrite.then(function() {
        return child_process.execAsync(command, {
          cwd: package_folder
        });
      });
      return proc;
    };
  })(this);

  module.exports = getCorpusSynsets = function(docs) {
    var analyses, doc, fMappingCandidates, parsedDocs;
    console.log(docs);
    if (Array.isArray(docs) === false) {
      docs = Array(docs);
    }
    analyses = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = docs.length; _i < _len; _i++) {
        doc = docs[_i];
        _results.push(analyze(doc));
      }
      return _results;
    })();
    parsedDocs = BPromise.all(analyses).map((function(_this) {
      return function(data) {
        var xmlString;
        xmlString = '<?xml version="1.0" encoding="UTF-8"?>' + data[0].split('<?xml version="1.0" encoding="UTF-8"?>')[1];
        return parseStringAsync(xmlString, {
          mergeAttrs: true,
          explicitArray: false
        });
      };
    })(this)).map((function(_this) {
      return function(data) {
        return data.MMOs.MMO;
      };
    })(this));
    fMappingCandidates = parsedDocs.map((function(_this) {
      return function(data) {
        if (!typeIsArray(data.Utterances.Utterance)) {
          data.Utterances.Utterance = Array(data.Utterances.Utterance);
        }
        return data.Utterances.Utterance.map(function(d) {
          if (!typeIsArray(d.Phrases.Phrase)) {
            d.Phrases.Phrase = Array(d.Phrases.Phrase);
          }
          return d.Phrases.Phrase.map(function(p) {
            var _ref;
            return (_ref = p.Mappings) != null ? _ref.Mapping : void 0;
          });
        });
      };
    })(this)).map((function(_this) {
      return function(x) {
        return _.flatten(x);
      };
    })(this)).map((function(_this) {
      return function(mappings) {
        return mappings.map(function(map) {
          return map != null ? map.MappingCandidates.Candidate : void 0;
        });
      };
    })(this)).map((function(_this) {
      return function(x) {
        return x.removeAll();
      };
    })(this));
    BPromise.all(fMappingCandidates).then((function(_this) {
      return function() {
        return fs.unlink("temp.txt");
      };
    })(this));
    return fMappingCandidates;
  };

}).call(this);
