import Disk from '../devices/fs/disk';
import FNode from '../devices/fs/fnode';
import { Directory, File } from '../devices/fs/file';
import FileSystem from '../devices/fs/filesystem';
import Kernel from '../kernel/kernel';

class System {
  constructor(devices=System.DEFAULT) {
    this.disk = devices.disk;
    this.input = devices.input;
    this.output = devices.output;
    this.kernel = null;
    this.bindKernel();
  }

  bindKernel() {
    const disk = this.disk;

    const classes = {};
    classes.FNode = FNode(disk);
    classes.Directory = Directory(classes);
    classes.File = File(classes);

    const _FileSystem = FileSystem(classes, this);
    const _Kernel = Kernel(classes, this, _FileSystem);
    
    this.kernel = new _Kernel();
  }

  boot() {
    this.kernel.init();
    this.kernel.run();
  }

  addInput(name, input) {
    this.kernel.addInput(name, input);
    this.input[name] = name;
  }

  removeInput(name) {
    this.kernel.removeInput(name);
    this.input[name] = null;
    delete this.input[name];
  }

  addOutput(name, output) {
    this.kernel.addOutput(name, output);
    this.output[name] = output;
  }

  removeOutput(name) {
    this.kernel.removeOutput(name);
    this.output[name] = null;
    delete this.output[name];
  }
}

System.DEFAULT = {
  disk: new Disk(),
  input: {},
  output: {}
};

export default System;