class Input {
  constructor() {
    this.callbacks = [];
  }

  subscribe(cb) {
    this.callbacks.push(cb);
  }

  unsubscribe(cb) {
    this.callbacks = this.callbacks.filter(callback => callback !== cb);
  }

  emit(event, data) {
    for (const cb of this.callbacks) {
      setTimeout(() => cb(event, data), 0);
    }
  }
}

export default Input;
