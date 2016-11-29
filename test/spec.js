var _ = require('lodash');
var bb = require('backbone');
var app = require('../index');
var spy = sinon.spy();
bb.sync = spy;

var Collection = app.Collection.extend({
  extends: ['filtered'],

  initialState: {
    filter: {
      order: 'ASC',
      orderby: 'title',
      limit: 10,
      qFields: ['title', 'field']
    }
  }
});

var collection;

beforeEach(function(){
  collection = new Collection();
  spy.reset();
});

describe('filter collection', function(){

  it('should be in a valid state', function(){
    expect(collection).to.be.ok;
  });

  it('should fetch using initial state', function(){
    collection.fetch();
    var options = spy.args[0][2];
    expect(options.data.filter).to.eql({
      order: 'ASC',
      orderby: 'title',
      limit: 10
    });
  });

  it('should give precedence to fetch options', function(){
    collection.fetch({
      data: {
        filter: {
          limit: -1
        }
      }
    });

    var options = spy.args[0][2];
    expect(options.data.filter).to.eql({
      limit: -1
    });
  });

  it('should allow filters to be set', function(){
    // name, value
    collection.setFilter('limit', -1);
    collection.fetch();

    var options = spy.args[0][2];
    expect(options.data.filter).to.eql({
      order: 'ASC',
      orderby: 'title',
      limit: -1
    });

    spy.reset();

    // set obj
    collection.setFilter({
      order: 'DESC',
      orderby: 'price'
    });
    collection.fetch();

    var options = spy.args[0][2];
    expect(options.data.filter).to.eql({
      order: 'DESC',
      orderby: 'price',
      limit: -1
    });
  });

  it('should reset to initial state', function(){
    collection.setFilter({
      order: 'DESC',
      orderby: 'price',
      limit: -1
    });
    collection.fetch();

    var options = spy.args[0][2];
    expect(options.data.filter).to.eql({
      order: 'DESC',
      orderby: 'price',
      limit: -1
    });

    spy.reset();

    collection.resetFilters();
    collection.fetch();

    var options = spy.args[0][2];
    expect(options.data.filter).to.eql({
      order: 'ASC',
      orderby: 'title',
      limit: 10
    });
  });

  it('should reset to given state', function(){
    collection.fetch();

    var options = spy.args[0][2];
    expect(options.data.filter).to.eql({
      order: 'ASC',
      orderby: 'title',
      limit: 10
    });

    spy.reset();

    collection.resetFilters({});
    collection.fetch();

    var options = spy.args[0][2];
    expect(options.data).to.be.undefined;
  });

  it('should directly set a query filter', function(){
    collection.setFilter('q', 'test');
    collection.fetch();

    var options = spy.args[0][2];
    expect(options.data.filter).to.eql({
      order: 'ASC',
      orderby: 'title',
      limit: 10,
      q: 'test',
      qFields: ['title', 'field']
    });
  });

  it('should set a simple unnamed query', function(){
    collection.setQuery('test');
    collection.fetch();

    var options = spy.args[0][2];
    expect(options.data.filter).to.eql({
      order: 'ASC',
      orderby: 'title',
      limit: 10,
      q: 'test',
      qFields: ['title', 'field']
    });

    expect(collection.hasQuery('__default')).to.be.true;
  });

  it('should set a simple named filter', function(){
    collection.setQuery('search', 'test');
    collection.fetch();

    var options = spy.args[0][2];
    expect(options.data.filter).to.eql({
      order: 'ASC',
      orderby: 'title',
      limit: 10,
      q: 'test',
      qFields: ['title', 'field']
    });

    expect(collection.hasQuery('search')).to.be.true;
  });

  it('should remove an unnamed query', function(){
    collection.setQuery('test');
    collection.fetch();

    var options = spy.args[0][2];
    expect(options.data.filter).to.eql({
      order: 'ASC',
      orderby: 'title',
      limit: 10,
      q: 'test',
      qFields: ['title', 'field']
    });

    spy.reset();

    collection.removeQuery();
    collection.fetch();

    var options = spy.args[0][2];
    expect(options.data.filter).to.eql({
      order: 'ASC',
      orderby: 'title',
      limit: 10
    });

    expect(collection.hasQuery('__default')).to.be.false;
  });

  it('should remove a named query', function(){
    collection.setQuery('search', 'test');
    collection.fetch();

    var options = spy.args[0][2];
    expect(options.data.filter).to.eql({
      order: 'ASC',
      orderby: 'title',
      limit: 10,
      q: 'test',
      qFields: ['title', 'field']
    });

    spy.reset();

    collection.removeQuery('search');
    collection.fetch();

    var options = spy.args[0][2];
    expect(options.data.filter).to.eql({
      order: 'ASC',
      orderby: 'title',
      limit: 10
    });

    expect(collection.hasQuery('search')).to.be.false;

  });

  it('should compact mulitple queries', function(){

    // directly set
    collection.setFilter({ q : 'bar' });

    // unnamed query
    collection.setQuery('test');

    // named query
    collection.setQuery('tab', [
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

    collection.fetch();

    var options = spy.args[0][2];
    expect(options.data.filter).to.eql({
      order: 'ASC',
      orderby: 'title',
      limit: 10,
      qFields: ['title', 'field'],
      q: [
        { type: 'string', query: 'bar' },
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
      ]
    });

    spy.reset();

    collection.removeQuery('tab');
    collection.fetch();

    var options = spy.args[0][2];
    expect(options.data.filter).to.eql({
      order: 'ASC',
      orderby: 'title',
      limit: 10,
      qFields: ['title', 'field'],
      q: [
        { type: 'string', query: 'bar' },
        { type: 'string', query: 'test' }
      ]
    });

  });

  it('should reset mulitple queries', function(){
    collection.setFilter({ q : 'foo' });
    collection.setQuery('bar');
    collection.fetch();

    var options = spy.args[0][2];
    expect(options.data.filter).to.eql({
      order: 'ASC',
      orderby: 'title',
      limit: 10,
      qFields: ['title', 'field'],
      q: [
        { type: 'string', query: 'foo' },
        { type: 'string', query: 'bar' }
      ]
    });

    spy.reset();
    collection.resetFilters();
    collection.fetch();

    var options = spy.args[0][2];
    expect(options.data.filter).to.eql({
      order: 'ASC',
      orderby: 'title',
      limit: 10
    });

  });

  it('should remove a empty queries', function(){
    collection.setQuery('search', 'test');
    collection.fetch();

    var options = spy.args[0][2];
    expect(options.data.filter).to.eql({
      order: 'ASC',
      orderby: 'title',
      limit: 10,
      qFields: ['title', 'field'],
      q: 'test'
    });

    spy.reset();
    collection.setQuery('search', '');
    collection.fetch();

    var options = spy.args[0][2];
    expect(options.data.filter).to.eql({
      order: 'ASC',
      orderby: 'title',
      limit: 10
    });

    expect(collection.hasQuery('search')).to.be.false;
  });

});