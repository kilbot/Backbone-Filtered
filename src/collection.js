var _ = require('lodash');
var Parser = require('query-parser');
var parse = new Parser();
var matchMaker = require('json-query');

var defaultQueryName = '__default';
var allowedFilters = [
  'context',
  'page',
  'per_page',
  'search',
  'after',
  'before',
  'exclude',
  'include',
  'offset',
  'order',
  'orderby',
  'parent',
  'parent_exclude',
  'sku',
  'featured',
  'category',
  'tag',
  'in_stock',
  'on_sale',
  'min_price',
  'max_price'
  // q,       // added later
  // qFields  // depends on q
];

module.exports = function(parent) {

  var FilteredCollection = parent.extend({

    constructor: function(){
      parent.apply(this, arguments);

      // clone this.initialState to this.state
      this.state = _.cloneDeep( this.initialState );
    },

    comparator: function(model){
      var orderBy = _.get(this.state, ['orderby']);
      if(orderBy){
        return model.get( orderBy );
      } else {
        return model.id;
      }
    },

    sort: function(options){
      var order = _.get(this.state, ['order'], 'ASC');
      this.models = _.sortByOrder(this.models, this.comparator.bind(this), order.toLowerCase());

      if (!_.get(options, 'silent')) {
        this.trigger('sort', this, options);
      }
      return this;
    },

    sync: function(method, collection, options){
      if(method === 'read'){
        var filter = _.get(options, ['data']) || this.getFilter();
        if( !_.isEmpty(filter) ){
          _.set(options, ['data'], filter);
        }
      }
      return parent.prototype.sync.call(this, method, collection, options);
    },

    /**
     *
     */
    getFilter: function(){
      var obj = _.pick( this.state, allowedFilters );

      var queries = this.compactQueries();
      if( !_.isEmpty(queries) ){
        obj.q = queries;
        obj.qFields = _.get(this.state, 'qFields');
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
      filter = _.get(this, 'state', {});
      merged = _.merge(filter, obj);
      _.set(this, 'state', merged);

      // make chainable
      return this;
    },

    resetFilters: function(obj){
      if(!_.isObject(obj)){
        var initialState = _.cloneDeep(this.initialState);
        obj = initialState || {};
      }
      _.set(this, 'state', obj);

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
      _.set(this, ['state', 'queries', queryName], {
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
      var q = _.get(this.state, 'q');
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

    // @todo: make matchMaker a base collection method
    // matchMaker: matchMaker

  });

  return FilteredCollection;

};