util = require 'util'
_    = require 'underscore'
BPromise = require 'bluebird'
{SynsetNode} = require './constructSynsetData'

generateCorpusTree = (docs) =>
  console.log("Generate corpus tree")
  console.log(docs)
  hashTable = {}
  allSynsets = _.flatten(docs)

  attachHypernyms = (synset, words, docIndices) =>
    id = synset.synsetid
    if id not of hashTable
      hashTable[id] = new SynsetNode synset
      hashTable[id].words = words
      hashTable[id].docs = docIndices
    else
      console.log(hashTable[id].words)
      hashTable[id].words = hashTable[id].words.concat(words)
      hashTable[id].docs = _.union(hashTable[id].docs, docIndices)

    if synset.isa then attachHypernyms(synset.isa, words, hashTable[id].docs)
    return

  for synset in allSynsets
    console.log(synset.words)
    if synset.synsetid not of hashTable
      hashTable[synset.synsetid] = synset
    else
      existing_synset = hashTable[synset.synsetid]
      existing_synset.docs =  _.union(existing_synset.docs, synset.docs)
      existing_synset.words =  existing_synset.words.concat(synset.words)
    if synset.parentId and synset.parentId != 'root'
      attachHypernyms(synset.data.isa, synset.words, synset.docs)

  return BPromise.props(hashTable)

generateWordTree = (doc) =>
  hashTable = {}

  attachHypernyms = (synset, words, docIndices) =>
    if synset.synsetid == undefined then debugger
    id = synset.synsetid
    if id not of hashTable
      hashTable[id] = new SynsetNode synset
      hashTable[id].words = words
      hashTable[id].docs = docIndices
    else
      hashTable[id].words = hashTable[id].words.concat(words)
      hashTable[id].docs = _.union(hashTable[id].docs, docIndices)

    if synset.hypernym.length > 0 then attachHypernyms(synset.hypernym[0], words, hashTable[id].docs)
    return

  for synset in doc
    if synset.synsetid not of hashTable
      hashTable[synset.synsetid] = synset
    else
      existing_synset = hashTable[synset.synsetid]
      existing_synset.docs =  _.union(existing_synset.docs, synset.docs)
      existing_synset.words =  existing_synset.words.concat(synset.words)
      existing_synset.baseWords =  existing_synset.baseWords.concat(synset.baseWords)
    if synset.parentId and synset.parentId != 'root'
      parent = WORDNETIFY_SYNSETS_TREE[synset.parentId]
      attachHypernyms(parent, synset.words, synset.docs)

  return hashTable

module.exports = {generateCorpusTree: generateCorpusTree, generateWordTree: generateWordTree}
