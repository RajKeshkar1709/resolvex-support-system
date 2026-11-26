const EventEmitter = require('events');

class AppEventBus extends EventEmitter {
  constructor() {
    super();
    // Allow higher listener capacity for multiple listeners per event
    this.setMaxListeners(25);
  }
}

const eventBus = new AppEventBus();
module.exports = eventBus;
