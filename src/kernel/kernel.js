import Process from './process';
import { InputService, OutputService } from './io-service';

const Kernel = (classes, system, FileSystem) => class _Kernel {
  constructor() {
    if (_Kernel.exists) {
      throw new Error('An instance of this Kernel has already been created');
    }

    this.bindFS = FileSystem(this);
    this.input = new InputService(this, system.input);
    this.output = new OutputService(this, system.output);

    this.processes = {};    
    this.Process = Process(classes, system, this);

    _Kernel.exists = true;
  }

  init() {
    const { Process } = this;
    this.root = new Process(['/bin/boot.lsc']);
    this.registerProcess(this.root);
  }

  run() {
    this.root.start();
  }

  exitProcess(pid) {
    if (pid === this.root.pid) {
      throw new Error('root process threw unhandled error');
    }
    this.input.clear(pid);
    this.currPid = this.processes[pid].parent.pid;
    this.processes[pid] = null;
    delete this.processes[pid];
  }

  switchProcess(p) {
    this.registerProcess(p);
    p.start();
  }

  registerProcess(p) {
    this.processes[p.pid] = p;
  }

  addInput(name, input) {
    this.input.addInput(name, input);
  }

  removeInput(name) {
    this.input.removeInput(name);
  }

  addOutput(name, output) {
    this.output.addOutput(name, output);
  }

  removeOutput(name) {
    this.output.removeOutput(name);
  }

  get activeProcesses() {
    return Object.keys(this.processes).map(pid => parseInt(pid));
  }
};

export default Kernel;
