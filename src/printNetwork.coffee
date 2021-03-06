getQuery = require './connect'
_ = require 'underscore'
Promise = require 'bluebird'
colors = require 'colors'
fs = require 'fs'

class Relation
  constructor: (params = {}) ->
    @id = params.UI
    @name = params.STY_RL
    @definition = params.DEF
    @tree_number = params.STN_RTN
    @inverse = params.RIN

class Concept
  attach: (rel) ->
    @[rel.RL] ?= []
    @[rel.RL].push rel.STY_RL2
  print: ->
    console.log "---------- CONCEPT ----------".green
    console.log "ID: ".yellow + @id.green
    console.log "Name: ".yellow  + @name.green
    console.log JSON.stringify @, null, 2
    console.log "-----------------------------".green

  constructor: (params = {}, relations) ->
    @id = params.UI
    @name = params.STY_RL
    @definition = params.DEF
    @tree_number = params.STN_RTN
    @attach relation for relation in relations

### SRDEF TABLE
Field Description
RT: Record Type (STY = Semantic Type or RL = Relation).
UI: Unique Identifier of the Semantic Type or Relation.
STY_RL: Name of the Semantic Type or Relation.
STN_RTN: Tree Number of the Semantic Type or Relation.
DEF: Definition of the Semantic Type or Relation.
EX: Examples of Metathesaurus concepts with this Semantic Type (STY records only).
UN: Usage note for Semantic Type assignment (STY records only).
NH: The Semantic Type and its descendants allow the non-human flag (STY records only).
ABR: Abbreviation of the Relation Name or Semantic Type.
RIN: Inverse of the Relation (RL records only).
###

fEdges = getQuery("SELECT * FROM SRSTR")
fDefs = getQuery("SELECT * FROM SRDEF")

network = Promise.join(fEdges, fDefs,
  (edges, definitions) =>
    ret = {}
    ret.relations = definitions[0]
      .filter( (x) => x.RT == 'RL')
      .map( (x) => new Relation(x))
    ret.concepts = definitions[0]
      .filter( (x) => x.RT == 'STY')
      .map( (x) =>
        relevant_relations =  edges[0].filter (e) =>
          e.STY_RL1 == x.STY_RL
        new Concept(x, relevant_relations)
      )
    ret.edges = edges[0]

    plotEdges = ret.edges.map( (e) =>
        o = {}
        o.type = e.RL
        for c,i in ret.concepts
          if c.name == e.STY_RL1
            o.source = i
          if c.name == e.STY_RL2
            o.target = i
        return o
    )

    plotEdges = plotEdges.filter( (e) => e.target != undefined ).filter( (e) => e.type == "isa")

    graph = {}
    graph.nodes = definitions[0].filter( (x) => x.RT == 'STY')
    graph.links = plotEdges

    graphJSON = JSON.stringify(graph, null, 2)
    fs.writeFile("graph.json", graphJSON)
)
