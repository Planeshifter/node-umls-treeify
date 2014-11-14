tm = require 'text-miner'
BPromise = require 'bluebird'
_ = require 'underscore'
util = require 'util'
fs = BPromise.promisifyAll( require 'fs' )
path = require 'path'
child_process = BPromise.promisifyAll( require 'child_process' )
parseStringAsync = BPromise.promisify( require('xml2js').parseString )

typeIsArray = Array.isArray || ( value ) -> return {}.toString.call( value ) is '[object Array]'

Array::removeAll = (v) -> x for x in @ when x!=v

config = JSON.parse(fs.readFileSync __dirname + '/../config.json')

escape = (str) ->
  '"' + str + '"'

args = ['--username ' + escape(config.umls.username), '--password ' + escape(config.umls.password),
        '--email ' + escape(config.umls.email)];
command = 'sh SKR_Web_API_V2_1/run.sh MMCustom ' + args.join(' ')

package_folder = path.join( __dirname, '..')

analyze = (doc) =>
  pWrite = fs.writeFileAsync('temp.txt', doc)
  proc = pWrite.then( () =>
    return child_process.execAsync(command, {
      cwd: package_folder
    })
  )
  return proc

module.exports = getCorpusSynsets = (docs) ->
    console.log docs
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
        return d.Phrases.Phrase.map( (p) => p.Mappings?.Mapping )
      )
    ).map( (x) =>
      return _.flatten(x)
    )
    .map( (mappings) =>
      return mappings.map( (map) => map?.MappingCandidates.Candidate)
    ).map(
      (x) => x.removeAll()
    )

    BPromise.all(fMappingCandidates).then () => fs.unlink("temp.txt")
    return fMappingCandidates
