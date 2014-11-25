(function() {
  var Concept, Promise, Relation, colors, fDefs, fEdges, getQuery, network, _;

  getQuery = require('./connect');

  _ = require('underscore');

  Promise = require('bluebird');

  colors = require('colors');

  Relation = (function() {
    function Relation(params) {
      if (params == null) {
        params = {};
      }
      this.id = params.UI;
      this.name = params.STY_RL;
      this.definition = params.DEF;
      this.tree_number = params.STN_RTN;
      this.inverse = params.RIN;
      this.abbreviation = params.ABR;
    }

    return Relation;

  })();

  Concept = (function() {
    Concept.prototype.attach = function(rel) {
      var _name;
      if (this[_name = rel.RL] == null) {
        this[_name] = [];
      }
      return this[rel.RL].push(rel.STY_RL2);
    };

    Concept.prototype.print = function() {
      console.log("---------- CONCEPT ----------".green);
      console.log("ID: ".yellow + this.id.green);
      console.log("Name: ".yellow + this.name.green);
      console.log(JSON.stringify(this, null, 2));
      return console.log("-----------------------------".green);
    };

    function Concept(params, relations) {
      var relation, _i, _len;
      if (params == null) {
        params = {};
      }
      this.id = params.UI;
      this.name = params.STY_RL;
      this.definition = params.DEF;
      this.tree_number = params.STN_RTN;
      this.abbreviation = params.ABR;
      for (_i = 0, _len = relations.length; _i < _len; _i++) {
        relation = relations[_i];
        this.attach(relation);
      }
    }

    return Concept;

  })();


  /* SRDEF TABLE
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
   */

  fEdges = getQuery("SELECT * FROM SRSTR");

  fDefs = getQuery("SELECT * FROM SRDEF");

  network = Promise.join(fEdges, fDefs, (function(_this) {
    return function(edges, definitions) {
      var ret;
      ret = {};
      ret.relations = definitions[0].filter(function(x) {
        return x.RT === 'RL';
      }).map(function(x) {
        return new Relation(x);
      });
      ret.concepts = definitions[0].filter(function(x) {
        return x.RT === 'STY';
      }).map(function(x) {
        var relevant_relations;
        relevant_relations = edges[0].filter(function(e) {
          return e.STY_RL1 === x.STY_RL;
        });
        return new Concept(x, relevant_relations);
      });
      ret.concepts = ret.concepts.map(function(o) {
        o.isa = ret.concepts.filter(function(e) {
          return e.name === o.isa[0];
        })[0];
        o.lexdomain = "umls";
        o.words = [
          {
            "lemma": o.name
          }
        ];
        return o;
      });
      ret.edges = edges[0];
      return ret;
    };
  })(this));

  module.exports = Promise.props(network);

}).call(this);
