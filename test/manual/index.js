const { System } = lusc;
const { Input, Output, fs: { Disk } } = lusc.devices;

const diskElem = new Vue({
  el: '#disk',
  data: {
    disk: { }
  }
});


class MyDisk extends Disk {
  constructor(...args) {
    super(...args);
    this.update();
  }

  wipe() {
    Disk.prototype.wipe.call(this);
    this.update();
  }

  update() {
    diskElem.disk = this.disk;
    diskElem.$forceUpdate();
  }
}

const output = new Output();
output.on('info', console.log);

const input = new Input();

const s = new System({
  disk: new MyDisk(),
  output: {
    console: output
  },
  input: {
    console: input
  }
});

const lscsh = cmd => {
  input.emit('cmd', cmd);
}

setInterval(() => s.disk.update(), 1000);

s.boot();
