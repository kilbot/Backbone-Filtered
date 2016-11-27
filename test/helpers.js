beforeEach(function() {
  this.sinon = sinon.sandbox.create();
  //this.server = sinon.fakeServer.create();
  //this.clock = sinon.useFakeTimers();
  global.stub = this.sinon.stub.bind(this.sinon);
  global.spy  = this.sinon.spy.bind(this.sinon);
});

afterEach(function() {
  this.sinon.restore();
  //this.server.restore();
  //this.clock.restore();
});