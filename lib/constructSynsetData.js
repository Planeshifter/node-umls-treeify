(function() {
  var SynsetNode, asArray, constructSynsetData, util, _;

  _ = require("underscore");

  util = require("util");

  asArray = function(input) {
    var ret;
    if (Array.isArray(input) === true) {
      return input;
    } else {
      ret = [];
      ret.push(input);
      return ret;
    }
  };

  constructSynsetData = function(candidate, docIndex) {
    var synset;
    synset = new SynsetNode(candidate.synset[0], docIndex, candidate);
    return synset;
  };

  SynsetNode = (function() {
    function SynsetNode(synset, docIndex, candidate) {
      var _ref;
      if (candidate == null) {
        candidate = {};
      }
      this.synsetid = synset.id;
      this.data = synset;
      this.wordCount = ((_ref = candidate.SemTypes) != null ? _ref.Count : void 0) || 1;
      this.docs = docIndex != null ? [docIndex] : [];
      this.docCount = 1;
      this.words = candidate.MatchedWords ? asArray(candidate.MatchedWords.MatchedWord) : [];
      console.log(this.words);
      this.CandidateCUI = candidate.CandidateCUI;
      if (synset.isa) {
        this.parentId = synset.isa.id;
      } else {
        this.parentId = "root";
      }
    }

    return SynsetNode;

  })();

  module.exports = {
    constructSynsetData: constructSynsetData,
    SynsetNode: SynsetNode
  };

}).call(this);
