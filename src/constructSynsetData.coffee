_ = require "underscore"
util = require "util"

asArray = (input) ->
  if Array.isArray(input) == true
    return input
  else
    ret = []
    ret.push(input)
    return ret

constructSynsetData = (candidate, docIndex) ->
  synset = new SynsetNode(candidate.synset[0], docIndex, candidate)
  return synset

class SynsetNode
  constructor: (synset, docIndex, candidate = {}) ->
    @synsetid = synset.id
    @data = synset
    @wordCount = candidate.SemTypes?.Count or 1
    @docs = if docIndex? then [docIndex] else []
    @docCount = 1
    @words = if candidate.MatchedWords then asArray(candidate.MatchedWords.MatchedWord) else []
    @CUIs = if candidate.CandidateCUI then asArray(candidate.CandidateCUI) else []
    if synset.isa
      @parentId = synset.isa.id
    else
      @parentId = "root"

module.exports = {constructSynsetData: constructSynsetData, SynsetNode: SynsetNode}
