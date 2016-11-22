var _ = require('lodash');
var app = require('../index');

var Collection = app.Collection.extend({
  extends: ['filtered'],
  fields: ['field']
});

describe('filter collection', function(){

  it('should be in a valid state', function(){
    var collection = new Collection();
    expect(collection).to.be.ok;
  });

  it('should set a simple filter', function(done){
    var collection = new Collection();

    collection.sync = function(method, collection, options){
      expect(method).eqls('read');
      expect(_.size(collection._filters)).eqls(1);
      expect(collection.hasFilter('__default')).to.be.true;
      expect(options.data.filter.q).eqls('test');
      expect(options.data.filter.fields).eqls(['field']);
      done();
    };

    collection.setFilter('test');

  });

  it('should set a named filter', function(done){
    var collection = new Collection();

    collection.sync = function(method, collection, options){
      expect(method).eqls('read');
      expect(_.size(collection._filters)).eqls(1);
      expect(collection.hasFilter('search')).to.be.true;
      expect(options.data.filter.q).eqls('test');
      expect(options.data.filter.fields).eqls(['field']);
      done();
    };

    collection.setFilter('search', 'test');

  });

  it('should remove a default filter', function(done){
    var collection = new Collection();
    collection.sync = function(){};
    collection.setFilter('test');

    collection.sync = function(method, collection, options){
      expect(method).eqls('read');
      expect(_.size(collection._filters)).eqls(0);
      expect(collection.hasFilter('__default')).to.be.false;
      expect(_.get(options, ['data', 'filter'])).to.be.undefined;
      done();
    };

    collection.removeFilter();

  });

  it('should remove a named filter', function(done){
    var collection = new Collection();
    collection.sync = function(){};
    collection.setFilter('search', 'test');

    collection.sync = function(method, collection, options){
      expect(method).eqls('read');
      expect(_.size(collection._filters)).eqls(0);
      expect(collection.hasFilter('__default')).to.be.false;
      expect(_.get(options, ['data', 'filter'])).to.be.undefined;
      done();
    };

    collection.removeFilter('search');

  });

  it('should reset mulitple filters', function(done){
    var collection = new Collection();
    collection.sync = function(){};
    collection.setFilter('test');
    collection.setFilter('search', 'test');
    expect(_.size(collection._filters)).eqls(2);

    collection.sync = function(method, collection, options){
      expect(method).eqls('read');
      expect(_.size(collection._filters)).eqls(0);
      expect(_.get(options, ['data', 'filter'])).to.be.undefined;
      done();
    };

    collection.resetFilters();

  });

  it('should compact mulitple simple filters', function(done){
    var collection = new Collection();
    collection.sync = function(){};
    collection.setFilter('test');
    collection.setFilter('search', 'test');
    expect(_.size(collection._filters)).eqls(2);
    expect(collection.getFilterQueries()).eqls('test');

    collection.sync = function(method, collection, options){
      expect(method).eqls('read');
      expect(_.size(collection._filters)).eqls(3);
      expect(options.data.filter.q).eqls('test');
      expect(options.data.filter.fields).eqls(['field']);
      done();
    };

    collection.setFilter('third', 'test');
  });

  it('should compact mulitple complex filters', function(done){
    var collection = new Collection();
    collection.sync = function(){};
    collection.setFilter('search', [
      { type: 'string', query: 'test' },
      { type: 'string', query: 'foo' },
      {
        type: "or",
        queries: [
          {
            type: "string",
            query: "sex"
          },
          {
            type: "string",
            query: "drugs"
          }
        ]
      }
    ]);

    collection.sync = function(method, collection, options){
      expect(method).eqls('read');
      expect(_.size(collection._filters)).eqls(2);
      expect(options.data.filter.q).eqls([
        { type: 'string', query: 'test' },
        { type: 'string', query: 'foo' },
        {
          type: "or",
          queries: [
            {
              type: "string",
              query: "sex"
            },
            {
              type: "string",
              query: "drugs"
            }
          ]
        },
        { type: 'string', query: 'bar' }
      ]);
      expect(options.data.filter.fields).eqls(['field']);
      done();
    };

    collection.setFilter('tab', [
      { type: 'string', query: 'test' },
      { type: 'string', query: 'bar' },
      {
        type: "or",
        queries: [
          {
            type: "string",
            query: "sex"
          },
          {
            type: "string",
            query: "drugs"
          }
        ]
      }
    ]);
  });

  it('should remove a empty filters', function(done){
    var collection = new Collection();
    collection.sync = function(){};
    collection.setFilter('search', 'test');

    collection.sync = function(method, collection, options){
      expect(method).eqls('read');
      expect(_.size(collection._filters)).eqls(0);
      expect(collection.hasFilter('__default')).to.be.false;
      expect(_.get(options, ['data', 'filter'])).to.be.undefined;
      done();
    };

    collection.setFilter('search', '');
  });

});