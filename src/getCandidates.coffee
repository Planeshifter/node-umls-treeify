tm = require 'text-miner'
BPromise = require 'bluebird'
_ = require 'underscore'
util = require 'util'
fs = BPromise.promisifyAll( require 'fs' )
path = require 'path'
metaMap = require 'meta-map'
{getQuery} = require './connect'
fNetwork = require './network'

config = JSON.parse(fs.readFileSync __dirname + '/../config.json')

typeIsArray = Array.isArray || ( value ) -> return {}.toString.call( value ) is '[object Array]'

Array::removeAll = (v) -> x for x in @ when x!=v

getCandidates = (docs) ->
    console.log(docs)
    parsedDocs = metaMap.getConcepts(docs, {})

    fMappingCandidates = parsedDocs.map( (data) =>
      if not typeIsArray(data.Utterances.Utterance) then data.Utterances.Utterance = Array(data.Utterances.Utterance)
      data.Utterances.Utterance.map( (d) =>
        if not typeIsArray(d.Phrases.Phrase) then d.Phrases.Phrase = Array(d.Phrases.Phrase)
        return d.Phrases.Phrase.map( (p) => p.Mappings?.Mapping )
      )
    ).map( (x) =>
      return _.flatten(x)
    )
    .map( (mappings) =>
      return mappings.map( (map) => map?.MappingCandidates.Candidate)
    ).map(
      (x) => x.removeAll(undefined)
    ).map( (doc) =>
      console.log util.inspect doc, null, 16
      doc = doc.map( (c) => {CandidateCUI: c.CandidateCUI, SemTypes: c.SemTypes, MatchedWords: c.MatchedWords} )
      console.log doc
      return doc
    ).map( (w) =>
      fNetwork.then( (network) =>
        w.synset = network.concepts.filter( (s) => s.abbreviation == w.SemTypes.SemType )
        console.log w
      )
    )
    return fMappingCandidates

module.exports = getCandidates