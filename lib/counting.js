(function() {
  var calculateCounts, _;

  _ = require('underscore');

  calculateCounts = function(tree) {
    var id, synset, _fn;
    console.log("TREE:");
    console.log(tree);
    _fn = function(synset) {};
    for (id in tree) {
      synset = tree[id];
      _fn(synset);
      synset.docCount = synset.docs.length;
      synset.wordCount = synset.words.length;
      synset.words = _.countBy(synset.words);
    }
    return tree;
  };

  module.exports = calculateCounts;

}).call(this);
