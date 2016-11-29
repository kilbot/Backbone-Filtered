var _ = require('lodash');
var Parser = require('query-parser');
var parse = new Parser();
var matchMaker = require('json-query');

var defaultQueryName = '__default';

module.exports = function(parent) {

  var FilteredCollection = parent.extend({

    constructor: function(){
      parent.apply(this, arguments);

      // clone this.initialState to this.state
      this.state = _.clone(this.initialState || {}, true);

      // if(this.superset === true){
      //   this.superset = this.toJSON();
      // }
    },

    sync: function(method, collection, options){
      if(method === 'read'){
        var filter = _.get(options, ['data', 'filter']) || this.getFilter();
        if( !_.isEmpty(filter) ){
          _.set(options, ['data', 'filter'], filter);
        }
      }
      return parent.prototype.sync.call(this, method, collection, options);
    },

    /**
     *
     */
    getFilter: function(){
      var filter = _.get(this.state, ['filter']);
      var obj = _.pick( filter, ['limit', 'order', 'orderby'] );
      var queries = this.compactQueries();
      if( !_.isEmpty(queries) ){
        obj.q = queries;
        obj.qFields = filter.qFields;
      }
      return obj;
    },

    setFilter: function(name, value){
      var filter, merged, obj = {};
      if(_.isString(name)){
        obj[name] = value;
      } else {
        obj = name;
      }
      filter = _.get(this.state, ['filter'], {});
      merged = _.merge(filter, obj);
      _.set(this, ['state', 'filter'], merged);

      // make chainable
      return this;
    },

    resetFilters: function(obj){
      if(!_.isObject(obj)){
        obj = _.get(this.initialState, 'filter', {});
      }
      _.set(this, 'state', {
        filter: obj,
        queries: {}
      });

      // make chainable
      return this;
    },

    setQuery: function (queryName, query) {
        if (query === undefined) {
          query = queryName;
          queryName = defaultQueryName;
        }
        if (!query) {
          return this.removeQuery(queryName);
        }
      _.set(this.state, ['queries', queryName], {
        string: query,
        query : _.isString(query) ? parse(query) : query
      });

      // make chainable
      return this;
    },

    getQueries: function(){
      return _.get(this.state, 'queries');
    },

    // hasQueries: function () {
    //   return _.size( this.getQueries() ) > 0;
    // },

    hasQuery: function (name) {
      return _.includes( _.keys( this.getQueries() ), name );
    },


    compactQueries: function () {
      var queries = _( this.getQueries() )
        .map('query')
        .flattenDeep()
        .value();

      // add filter.q
      var q = _.get(this.state, ['filter', 'q']);
      if(_.isString(q)){
        queries.unshift({
          type: 'string',
          query: q
        });
      } else if(_.isObject(q)) {
        queries.unshift(q);
      }

      // compact
      if (queries.length > 1) {
        queries = _.reduce(queries, function (result, next) {
          if (!_.some(result, function (val) {
              return _.isEqual(val, next);
            })) {
            result.push(next);
          }
          return result;
        }, []);
      }

      // extra compact for common simple query
      if (queries.length === 1 && _.get(queries, [0, 'type']) === 'string') {
        queries = _.get(queries, [0, 'query']);
      }

      return queries;
    },

    removeQuery: function (queryName) {
      if (!queryName) {
        queryName = defaultQueryName;
      }
      if(this.hasQuery(queryName)){
        delete this.state.queries[queryName];
      }

      // make chainable
      return this;
    }

    // supersetFetch: function(){
    //   var self = this;
    //   var models = _.filter(this.superset, function(model){
    //     return matchMaker(model, self.getFilterQueries(), {fields: self.fields});
    //   });
    //   return this.reset(models);
    // }

  });

  return FilteredCollection;

};