var jsdom = require('jsdom').jsdom;
global.document = jsdom('backbone query tests');
global.window = global.document.parentWindow;
global._ = require('lodash');

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);
global.expect = chai.expect;
global.sinon = sinon;