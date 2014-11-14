tm = require 'text-miner'
BPromise = require 'bluebird'
_ = require 'underscore'
util = require 'util'
fs = require 'fs'
path = require 'path'
child_process = BPromise.promisifyAll( require 'child_process' )
parseStringAsync = BPromise.promisify( require('xml2js').parseString )

typeIsArray = Array.isArray || ( value ) -> return {}.toString.call( value ) is '[object Array]'

config = JSON.parse(fs.readFileSync __dirname + '/../config.json')

escape = (str) ->
  '"' + str + '"'

args = ['--username ' + escape(config.umls.username), '--password ' + escape(config.umls.password),
        '--email ' + escape(config.umls.email)];
command = 'sh SKR_Web_API_V2_1/run.sh MMCustom ' + args.join(' ')

package_folder = path.join( __dirname, '..')

analyze = (doc) =>
  proc = child_process.execAsync(command, {
    cwd: package_folder
  })
  return proc

module.exports = getCorpusSynsets = (docs) ->
    if Array.isArray(docs) == false then docs = Array(docs);

    analyses = (analyze doc for doc in docs)

    parsedDocs = BPromise.all(analyses)
      .map( (data) =>
        xmlString = '<?xml version="1.0" encoding="UTF-8"?>' + data[0].split('<?xml version="1.0" encoding="UTF-8"?>')[1]
        return parseStringAsync(xmlString, {
            mergeAttrs: true,
            explicitArray: false
          })
      )
      .map( (data) =>
        data.MMOs.MMO
      )

    fMappingCandidates = parsedDocs.map( (data) =>
      if not typeIsArray(data.Utterances.Utterance) then data.Utterances.Utterance = Array(data.Utterances.Utterance)
      data.Utterances.Utterance.map( (d) =>
        if not typeIsArray(d.Phrases.Phrase) then d.Phrases.Phrase = Array(d.Phrases.Phrase)
        return d.Phrases.Phrase.map( (p) => p.Mappings.Mapping )
      )
    ).then( (x) =>
      return _.flatten(x)
    )
    .then( (mappings) =>
      return mappings.map( (map) => map.MappingCandidates.Candidate)
    )

    return fMappingCandidates
