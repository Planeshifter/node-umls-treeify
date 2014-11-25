util = require 'util'
_    = require 'underscore'
BPromise = require 'bluebird'
{SynsetNode} = require './constructSynsetData'

generateCorpusTree = (docs) =>

  hashTable = {}
  allSynsets = _.flatten(docs)

  attachHypernyms = (synset, words, docIndices, CUIs) =>
    id = synset.id

    if id not of hashTable
      hashTable[id] = new SynsetNode synset
      hashTable[id].words = words
      hashTable[id].docs = docIndices
      hashTable[id].CUIs = CUIs
    else
      hashTable[id].words = hashTable[id].words.concat(words)
      hashTable[id].docs = _.union(hashTable[id].docs, docIndices)
      hashTable[id].CUIs = hashTable[id].CUIs.concat(CUIs)

    if synset.isa then attachHypernyms(synset.isa, words, hashTable[id].docs, CUIs)
    return

  for synset in allSynsets
    if synset.synsetid not of hashTable
      hashTable[synset.synsetid] = synset
    else
      existing_synset = hashTable[synset.synsetid]
      existing_synset.docs =  _.union(existing_synset.docs, synset.docs)
      existing_synset.words =  existing_synset.words.concat(synset.words)
      existing_synset.CUIs = existing_synset.CUIs.concat(synset.CUIs)
    if synset.parentId and synset.parentId != 'root'
      attachHypernyms(synset.data.isa, synset.words, synset.docs, synset.CUIs)

  return BPromise.props(hashTable)

generateWordTree = (doc) =>
  hashTable = {}

  attachHypernyms = (synset, words, docIndices, CUIs) =>

    id = synset.synsetid

    if id not of hashTable
      hashTable[id] = new SynsetNode synset
      hashTable[id].words = words
      hashTable[id].docs = docIndices
      hashTable[id].CUIs = CUIs
    else
      hashTable[id].words = hashTable[id].words.concat(words)
      hashTable[id].docs = _.union(hashTable[id].docs, docIndices)
      hashTable[id].CUIs = hashTable[id].CUIs.concat(CUIs)

    if synset.isa then attachHypernyms(synset.isa, words, hashTable[id].docs, CUIs)
    return

  for synset in doc
    if synset.synsetid not of hashTable
      hashTable[synset.synsetid] = synset
    else
      existing_synset = hashTable[synset.synsetid]
      existing_synset.docs =  _.union(existing_synset.docs, synset.docs)
      existing_synset.words =  existing_synset.words.concat(synset.words)
      existing_synset.CUIs = existing_synset.CUIs.concat(synset.CUIs)
    if synset.parentId and synset.parentId != 'root'
      attachHypernyms(synset.data.isa, synset.words, synset.docs, synset.CUIs)

  return hashTable

module.exports = {generateCorpusTree: generateCorpusTree, generateWordTree: generateWordTree}
