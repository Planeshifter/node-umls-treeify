tm = require 'text-miner'
BPromise = require 'bluebird'
_ = require 'underscore'
util = require 'util'
fs = require 'fs'

module.exports = getCorpusSynsets = (docs) ->
    if Array.isArray(docs) == false then docs = Array(docs);
    corpus = new tm.Corpus(docs)
        .removeInterpunctuation()
        .removeNewlines()
        .toLower()
        .clean()
        .removeWords(tm.STOPWORDS.EN)
        .clean();

    wordArrays = corpus.documents.map( (x) =>  return x.split(" ") )

    wordArrays = wordArrays.map( (arr) =>
      arr.reduce( (a,b) =>
        existingWord = a.filter (x) => return x.string == b
        if existingWord.length > 0
          existingWord[0].count++
          return a
        else
          word = {}
          word.string = b
          word.count = 1
          return a.concat(word)
      , [])
    )

    return wordArrays

    ###
    logger.log("info","This is the array of unique word arrays", {uniqueWordArrays: wordArrays});

    var res = wordArrays.map(function(arr){
      return createDocTree(arr);
    });

    logger.log("info","These are the doc synset Trees",{docTrees:res});

    return res;
  };
  function createDocTree(wordArray){

    var baseWordArray = wordArray.map(function(x){
      x.baseWords = morphy(x.string);
      logger.log("info","Morphy base words",{x:x});
      return x;
    });

    var synsetsArray = baseWordArray.map(function(w){
    if (!_.isEmpty(w.baseWords)){
      var bw = new Word(w.baseWords[0].lemma, "n");
      w.synsets = getWordSynsets(bw);
      return w;
    } else {
      w.synsets = null;
      return w;
    }
    });

    return synsetsArray;
  }

  var getWordSynsets = memoize(function(word){
    return word.getSynsets();
  });
###
