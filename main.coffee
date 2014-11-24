#!/usr/bin/env node

getQuery = require __dirname + '/lib/connect'
fNetwork = require __dirname + '/lib/network'
getConcepts = require __dirname + '/lib/getCandidates'
{constructSynsetData} = require __dirname + '/lib/constructSynsetData'

BPromise = require 'bluebird'
winston = require 'winston'
Promise = require 'bluebird'
program = require 'commander'
fs = require 'fs'
csv = require 'csv'
mime = require 'mime'
util = require 'util';

createTree = (corpus) ->
  conceptCandidates = getConcepts(corpus)
  docTrees = conceptCandidates.map( (d, index) =>
    docTreeMsg = "Construct Candidate Set for Words of Doc " + index
    console.time(docTreeMsg)
    wordTrees = d.map( (w) => constructSynsetData(w, index) )
    BPromise.all(wordTrees).then console.timeEnd(docTreeMsg)
    return wordTrees
  )
  conceptCandidates.then( (data) => console.log util.inspect(data, null, 4) )

program
  .version('0.1.0')
  .option('-i, --input [value]', 'Load data from disk')
  .option('-l, --list <items>','A list of input texts')
  .option('-o, --output [value]', 'Write results to file')
  .option('-t, --threshold <n>', 'Threshold for Tree Nodes', parseInt)
  .option('-c, --combine','Merge document trees to form corpus tree')
  .option('-d, --delim [value]','Delimiter to split text into documents')
  .option('-v, --verbose','Print additional logging information')
  .parse(process.argv);


corpus
delim = program.delim

if program.list
  delim ?= ";"
  corpus = program.list.split(delim)
  createTree(corpus);
else if program.input
  data = fs.readFileSync(program.input)
  mime_type = mime.lookup(program.input)
switch mime_type
  when "text/plain"
    delim ?= " "
    corpus = String(data).replace(/\r\n?/g, "\n").split(delim).clean("")
    createTree(corpus)
  when "text/csv"
    csv.parse String(data), (err, output) =>
      corpus = output.map( (d) => return d[0])
      createTree(corpus)
