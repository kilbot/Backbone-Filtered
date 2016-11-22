var jsdom = require('jsdom').jsdom;
global.document = jsdom('backbone query tests');
global.window = global.document.parentWindow;
global._ = require('lodash');

var chai = require('chai');
chai.should();
global.expect = chai.expect;