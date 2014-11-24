(function() {
  var BPromise, config, fNetwork, fs, getCandidates, getQuery, metaMap, path, tm, typeIsArray, util, _;

  tm = require('text-miner');

  BPromise = require('bluebird');

  _ = require('underscore');

  util = require('util');

  fs = BPromise.promisifyAll(require('fs'));

  path = require('path');

  metaMap = require('meta-map');

  getQuery = require('./connect').getQuery;

  fNetwork = require('./network');

  config = JSON.parse(fs.readFileSync(__dirname + '/../config.json'));

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

  getCandidates = function(docs) {
    var fMappingCandidates, parsedDocs;
    console.log(docs);
    parsedDocs = metaMap.getConcepts(docs, {});
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
        return x.removeAll(void 0);
      };
    })(this)).map((function(_this) {
      return function(doc) {
        console.log(util.inspect(doc, null, 16));
        doc = doc.map(function(c) {
          return {
            CandidateCUI: c.CandidateCUI,
            SemTypes: c.SemTypes,
            MatchedWords: c.MatchedWords
          };
        });
        console.log(doc);
        return doc;
      };
    })(this)).map((function(_this) {
      return function(w) {
        return fNetwork.then(function(network) {
          w.synset = network.concepts.filter(function(s) {
            return s.abbreviation === w.SemTypes.SemType;
          });
          return console.log(w);
        });
      };
    })(this));
    return fMappingCandidates;
  };

  module.exports = getCandidates;

}).call(this);
