class Output {
  constructor() {
    this.callbacks = {};
  }

  emit(event, data) {
    if (event === '*') {
      for (const cbs of Object.values(this.callbacks)) {
        for (const cb of cbs) {
          cb(data);
        }
      }
    } else {
      for (const cb of this.callbacks[event] || []) {
        cb(data);
      }
    }
  }

  on(event, cb) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(cb);
  }
}

export default Output;
