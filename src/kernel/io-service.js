class InputService {
  constructor(kernel, inputs={}) {
    this.kernel = kernel;
    this.inputs = {};
    this.intCallbacks = {};
    this.callbacks = {};

    for (const [name, input] of Object.entries(inputs)) {
      this.addInput(name, input);
    }
  }

  addInput(name, input) {
    this.inputs[name] = input;
    const cb = (event, data) => this.onInput(name, event, data);
    this.intCallbacks[name] = cb;
    input.subscribe(cb);
  }

  removeInput(name) {
    const input = this.inputs[name];
    this.intCallbacks[name] = null;
    delete this.intCallbacks[name];
    input.unsubscribe(cb);
  }

  onInput(name, event, data) {
    for (const cbs of Object.values(this.callbacks)) {
      if (cbs[name]) {
        for (const cb of cbs[name][event] || []) {
          setTimeout(cb(data), 0);
        }

        for (const cb of cbs[name]['*'] || []) {
          setTimeout(cb(data), 0);
        }
      }
      if (cbs['*']) {
        for (const cb of cbs['*']['*'] || []) {
          setTimeout(cb(data), 0);
        }
      }
    }
  }

  on(pid, name, event, cb) {
    const cbs = this.callbacks[pid];
    if (!cbs[name]) {
      cbs[name] = {};
    }
    if (!cbs[name][event]) {
      cbs[name][event] = [];
    }
    cbs[name][event].push(cb);
  }

  bind(pid) {
    this.callbacks[pid] = {};
    return (name, event, cb) => this.on(pid, name, event, cb);
  }

  clear(pid) {
    this.callbacks[pid] = null;
    delete this.callbacks[pid];
  }

  getDevice(name) {
    return this.inputs[name];
  }

  get devices() {
    return Object.keys(this.inputs);
  }
}

class OutputService {
  constructor(kernel, outputs={}) {
    this.kernel = kernel;
    this.outputs = {};
    for (const [name, output] of Object.entries(outputs)) {
      this.addOutput(name, output);
    }
  }

  addOutput(name, output) {
    this.outputs[name] = output;
  }

  removeOutput(name) {
    this.outputs[name] = null;
    delete this.outputs[name];
  }

  emit = (pid, name, event, data) => {
    if (!(this.kernel.activeProcesses.find(p => p === pid))) return;

    if (name === '*') {
      for (const output of Object.values(this.outputs)) {
        output.emit(event, data);
      }
    } else {
      this.outputs[name] && this.outputs[name].emit(event, data);
    }
  }

  bind(pid) {
    return (name, event, data) => this.emit(pid, name, event, data);
  }

  getDevice(name) {
    return this.outputs[name];
  }

  get devices() {
    return Object.keys(this.outputs);
  }
}

export {
  InputService,
  OutputService
};
