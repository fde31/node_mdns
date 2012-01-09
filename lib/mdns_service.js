var dns_sd    = require('./dns_sd')
  , util    = require('util')
  , events  = require('events')
  ;

var IOWatcher = process.binding('io_watcher').IOWatcher
  ;

function MDNSService() {
  events.EventEmitter.call(this);
  var self = this;

  self.serviceRef = new dns_sd.DNSServiceRef();
  self.watcher = new IOWatcher();
  self.watcher.host = self; // TODO: Find out what this is for ...
  self.watcher.callback = function() {
    dns_sd.DNSServiceProcessResult.call(self, self.serviceRef);  
  };
}
util.inherits(MDNSService, events.EventEmitter);
exports.MDNSService = MDNSService;

MDNSService.prototype.start = function() {
  if (this._watcherStarted) {
    throw new Error("mdns service already started");
  }
  this.watcher.set(this.serviceRef.fd, true, false);
  this.watcher.start();
  this._watcherStarted = true;
}

MDNSService.prototype.stop = function() {
  if (this._watcherStarted) {
    this.watcher.stop();
    dns_sd.DNSServiceRefDeallocate(this.serviceRef);
    this.serviceRef = null;
    this._watcherStarted = false;
  }
}